from flask import Flask, jsonify, request, abort
from pymongo import MongoClient
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from bson import ObjectId
import certifi

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'SEGREDO_MUITO_FORTE_AQUI'

uri = "mongodb+srv://ilie_iftime:ilieilie@clusteruniversidade.ssyqpnq.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client["HomeDeco"]

#Decorador que valida se a requisição tem um token válido
def token_required(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        
        token = request.headers.get('Authorization', '').removeprefix('Bearer ').strip() #Extrair token do header
        if not token:
            abort(401, "Token missing") #Falta token
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"]) #Descodifica token
        except jwt.ExpiredSignatureError:
            abort(401, "Token expired") #Token expirado
        except:
            abort(401, "Invalid token") #Token inválido
        return f(*args, **kwargs, payload=payload) #Passa payload como argumento
    return wrapped

#USERS

#Listar todos os utilizadores, sem password
@app.route("/users", methods=["GET"])
@token_required
def list_users(payload):
    cursor = db.users.find({}, {"password": 0}) #Procura todos os utilizadores, omite a password
    users = []
    for u in cursor:
        u["_id"] = str(u["_id"]) #Converte o ID para string
        users.append(u)
    return jsonify(users)

#Criar um novo registo/utilizador
@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json() or {}

    if not all(k in data for k in ("username", "email", "password")): #Verifica os campos obrigatórios
        abort(400, "username, email e password são obrigatórios")

    if db.users.find_one({"$or": [{"username": data["username"]}, {"email": data["email"]}]}): #Verifica duplicação de dados
        abort(409, "Username ou email já existe")

    hashed = generate_password_hash(data["password"]) #Encripta a password

    role = "admin" if data["email"].lower() in ["admin@homedeco.pt"] else "customer" #Define o tipo de utilizador (administrador ou cliente)

    novo = {
        "username": data["username"],
        "email": data["email"],
        "password": hashed,
        "role": role,
        "createdAt": datetime.utcnow(), #Data de criação
        "favoritos": []
    }

    res = db.users.insert_one(novo) #Insere o utilizador na BD
    novo["_id"] = str(res.inserted_id)
    del novo["password"] #Remove a password
    return jsonify(novo), 201

#Atualizar dados do utilizador pelo ID
@app.route("/users/<id>", methods=["PUT"])
@token_required
def update_user(id, payload):
    data = request.get_json() or {}

    if not data:
        abort(400, "Dados de atualização não fornecidos") #Caso não haja dados

    if "password" in data:
        data["password"] = generate_password_hash(data["password"]) #Caso atualize password, encripta nova password

    try:
        result = db.users.update_one({"_id": ObjectId(id)}, {"$set": data})
    except Exception:
        abort(500, "Erro ao atualizar utilizador")

    if result.matched_count == 0:
        abort(404, "Utilizador não encontrado") #Se nenhum utilizador for encontrado

    return jsonify({"message": "Utilizador atualizado com sucesso"}), 200

#Eliminar utilizador por ID
@app.route("/users/<id>", methods=["DELETE"])
@token_required
def delete_user(id, payload):
    result = db.users.delete_one({"_id": ObjectId(id)}) #Elimina na BD
    if result.deleted_count == 0:
        abort(404, "User not found") #Se nenhum for apagado
    return jsonify({"message": "User deleted"})

#Fazer login
@app.route("/user/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    u = db.users.find_one({
        "$or": [
            {"username": data.get("username")},
            {"email": data.get("username")}
        ]
    }) #Procura por username ou email

    if not u or not check_password_hash(u["password"], data.get("password", "")):
        abort(401, "Credenciais inválidas") #Verifica a password

    token = jwt.encode({
        "sub": u["username"],         
        "id": str(u["_id"]),
        "role": u["role"],         
        "username": u["username"],       
        "exp": datetime.utcnow() + timedelta(hours=2) #Token expira em duas horas
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"token": token})

#Verifica se o utilizador existe e a password está correta
@app.route("/user/confirmation", methods=["POST"])
def confirm_utilizador():
    data = request.get_json() or {}
    user = db.users.find_one({"_id": ObjectId(data.get("id"))})
    password = db.users.find_one({"password": data.get("password")})
    if not user or not user.find_one({"_id": ObjectId(data.get("id"))}):
        abort(404, "Uilizador não encontrado")
    if not password or not check_password_hash(password["password"], data.get("password", "")):
        abort(401, "Password incorreta")                                       
    if not all(p in data for p in ("username", "email")):
        abort(400, "O nome de utlizador e/ou o email não foram encontrados")
        user.find_one({"username" : data["username"], "email": data["email"]})

#Obter os dados do utilizador autenticado
@app.route("/user/me", methods=["GET"]) 
@token_required
def get_user_info(payload):
    print("PAYLOAD RECEBIDO NO /user/me:", payload)#Debug

    username = payload.get("sub")
    print("Username extraído do token:", username)#Debug

    user = db.users.find_one({"username": username}, {"password": 0}) #Procura o username, omitindo a password
    if not user:
        print("Utilizador não encontrado no MongoDB!")#Debug
        abort(404, "Utilizador não encontrado")

    user["_id"] = str(user["_id"])
    user["historico"] = user.get("historico", []) #Garante que o histórico existe
    return jsonify(user)

#Gerir favoritos
@app.route("/user/favoritos", methods=["GET"])
@token_required
def obter_favoritos(payload):
    user_id = payload["id"]
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"favoritos": 1})
    if not user:
        abort(404, "Utilizador não encontrado")
    return jsonify(user.get("favoritos", []))

#Adiciona ou apaga produto dos favoritos
@app.route("/user/favoritos/<int:produto_id>", methods=["PUT"])
@token_required 
def alternar_favorito(produto_id, payload):
    user_id = payload["id"]
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        abort(404, "Utilizador não encontrado")

    favoritos = user.get("favoritos", [])
    if not isinstance(favoritos, list):
        favoritos = []

    if produto_id in favoritos:
        favoritos.remove(produto_id) #Remove o produto se já existir
    else:
        favoritos.append(produto_id) #Adiciona se não existir

    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"favoritos": favoritos}})
    return jsonify({"message": "Favoritos atualizados", "favoritos": favoritos})

#Adicionar favoritos
@app.route("/user/favoritos/<int:produto_id>", methods=["POST"])
@token_required
def adicionar_favorito(produto_id, payload):
    user_id = payload["id"]
    user = db.users.find_one({"_id": ObjectId(user_id)}) #Procura o utilizador na BD
    if not user:
        abort(404, "Utilizador não encontrado")

    favoritos = user.get("favoritos", []) #Lista de favoritos do utilizador
    if not isinstance(favoritos, list):
        favoritos = []

    if produto_id in favoritos:
        return jsonify({"message": "Produto já está nos favoritos"}), 200 #Se o produto já está na lista, retorna aviso

    favoritos.append(produto_id)

    #Atualiza a lista de favoritos do utilizador
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"favoritos": favoritos}})
    return jsonify({"message": "Produto adicionado aos favoritos", "favoritos": favoritos}), 201

#Limpar todos os favoritos
@app.route("/user/favoritos", methods=["DELETE"])
@token_required
def limpar_favoritos(payload):
    user_id = payload["id"]
    result = db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"favoritos": []}}) #Limpa favoritos
    
    if result.modified_count == 0:
        return jsonify({"message": "Nenhuma alteração feita"}), 200
    
    return jsonify({"message": "Favoritos eliminados"}), 200

#Histórico de compras
@app.route("/user/historico", methods=["GET"])
@token_required
def obter_historico(payload):
    user_id = payload["id"]
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"historico": 1}) #Obtém apenas o histórico
    
    if not user:
        abort(404, "Utilizador não encontrado") #Caso não exista, retrna erro
    
    historico = user.get("historico", []) #Garante que o histórico seja uma lista
    return jsonify({"total": len(historico), "historico": historico})

@app.route("/user/historico", methods=["POST"])
@token_required
def adicionar_historico(payload):
    try:
        data = request.get_json()
        itens_recebidos = data.get("itens", []) #Lista de itens comprados
        total = data.get("total", 0)

        itens_formatados = []

        for item in itens_recebidos:
            produto_id = item.get("id")
            tamanho = item.get("tamanho")
            quantidade = item.get("quantidade", 1)

            produto = db.products.find_one({"id": produto_id}) #Vai buscar o produto à BD
            if not produto:
                continue #Caso não encontre, continua

            item_snapshot = {
                "id": produto_id,
                "name": produto.get("name", "Produto"),
                "price": produto.get("price", 0),
                "image": produto.get("image", "/placeholder.png"),
                "tamanho": tamanho,
                "quantidade": quantidade
            } #Guarda os dados do produto procurado
            itens_formatados.append(item_snapshot)

        nova_compra = {
            "data": datetime.utcnow().isoformat(),
            "itens": itens_formatados,
            "total": total
        }

        db.users.update_one(
            {"_id": ObjectId(payload["id"])},
            {"$push": {"historico": {"$each": [nova_compra], "$position": 0}}}
        ) #Insere no histórico na primeira posição 

        return jsonify({"message": "Compra adicionada ao histórico com sucesso"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Erro ao guardar histórico"}), 500

#Eliminar histórico de compras do utilizador
@app.route("/user/historico", methods=["DELETE"])
@token_required
def eliminar_historico(payload):
    user_id = payload["id"]

    #Atualiza o campo "histórico", retornando a lista vazia
    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"historico": []}}
    )

    #Verifica se o utilizador foi encontrado na base de dados
    if result.matched_count == 0:
        abort(404, "Utilizador não encontrado")

    return jsonify({"message": "Histórico eliminado com sucesso"}), 200

#Carrinho de compras
@app.route("/user/carrinho", methods=["GET"])
@token_required
def obter_carrinho(payload):
    user_id = payload["id"]
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"carrinho": 1}) #Vai procurar o carrinho
    if not user:
        abort(404, "Utilizador não encontrado")
    return jsonify(user.get("carrinho", []))

#Adicionar produto ao carrinho
@app.route("/user/carrinho", methods=["POST"])
@token_required
def adicionar_ao_carrinho(payload):
    user_id = payload["id"]
    data = request.get_json()

    #Verifica se os campos obrigatórios foram dados
    if not data or not all(k in data for k in ("id", "tamanho", "quantidade")):
        abort(400, "Campos obrigatórios: id, tamanho, quantidade")

    #Cria um novo item de carrinho com os dados
    novo_item = {
        "id": data["id"],
        "tamanho": data["tamanho"],
        "quantidade": data["quantidade"]
    }

    try:
        # Adiciona o novo item ao carrinho do utilizador na base de dados
        resultado = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"carrinho": novo_item}}
        )

        if resultado.modified_count == 0:
            abort(500, "Carrinho não foi atualizado")

        return jsonify({"message": "Produto adicionado ao carrinho"}), 200

    except Exception as e:
        print(f"[ERRO] Erro ao adicionar ao carrinho: {str(e)}")
        return jsonify({"error": "Erro interno ao adicionar produto ao carrinho"}), 500
    
#Limpar o carrinho do utilizador
@app.route("/user/carrinho", methods=["DELETE"])
@token_required
def limpar_carrinho(payload):
    user_id = payload["id"]
    try:
        #Atualiza o carrinho do utilizador para uma lista vazia
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"carrinho": []}}
        )

        #Caso o carrinho já estivesse vazio ou não foi modificado
        if result.modified_count == 0:
            return jsonify({"message": "Carrinho já estava vazio ou nenhum item foi removido"}), 200
        
        return jsonify({"message": "Carrinho limpo com sucesso"}), 200

    except Exception as e:
        print("[ERRO ao limpar carrinho]:", e)
        return jsonify({"error": "Erro ao limpar carrinho"}), 500

#Atualiza o carrinho
@app.route("/user/carrinho", methods=["PUT"])
@token_required
def atualizar_carrinho(payload):
    user_id = payload["id"]
    data = request.get_json() #Lê o novo carrinho
    novo_carrinho = data.get("carrinho")

    if not isinstance(novo_carrinho, list):
        abort(400, "Formato de carrinho inválido")

    try:
        #Atualiza carrinho na BD
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"carrinho": novo_carrinho}}
        )

        #Obter os IDs de produtos no carrinho
        ids_no_carrinho = {item["id"] for item in novo_carrinho}

        #Remover os IDs do carrinho dos favoritos
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"favoritos": {"$in": list(ids_no_carrinho)}}}
        )

        return jsonify({"message": "Carrinho atualizado e favoritos ajustados"}), 200

    except Exception as e:
        print("[ERRO ao atualizar carrinho]:", e)
        return jsonify({"error": "Erro ao atualizar carrinho"}), 500
    
#Eliminar conta do utilizador autenticado
@app.route('/user/eliminar-conta', methods=['DELETE'])
@token_required
def eliminar_conta(payload):
    user_id = payload.get("id")
    if not user_id:
        abort(400, "ID do utilizador não encontrado no token") #Antes de eliminar procura se existe

    result = db.users.delete_one({'_id': ObjectId(user_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Conta eliminada com sucesso!"}), 200 #Caso seja encontrada, elimina
    else:
        return jsonify({"error": "Erro ao eliminar a conta"}), 500 #Caso contrário, retorna erro
    
#Atualizar os dados do utilizador (username, email, password)
@app.route("/user/update", methods=["PUT"])
@token_required
def atualizar_utilizador(payload):
    user_id = payload.get("id")
    data = request.get_json() or {}

    if not user_id:
        return jsonify({"message": "ID do utilizador não encontrado."}), 400

    user = db.users.find_one({"_id": ObjectId(user_id)}) #Vai buscar o utilizador atual
    if not user:
        return jsonify({"message": "Utilizador não encontrado."}), 404

    campos_validos = {} #Campos que serão atualizados 

    if "username" in data and data["username"] != user.get("username"):
        existente = db.users.find_one({"username": data["username"], "_id": {"$ne": ObjectId(user_id)}})
        if existente:
            return jsonify({"message": "username ocupado"}), 409
        campos_validos["username"] = data["username"]

    if "email" in data and data["email"] != user.get("email"):
        existente = db.users.find_one({"email": data["email"], "_id": {"$ne": ObjectId(user_id)}})
        if existente:
            return jsonify({"message": "email ocupado"}), 409
        campos_validos["email"] = data["email"]

    if "password" in data and data["password"].strip():
        password_atual = data.get("passwordAtual", "")
        if not check_password_hash(user["password"], password_atual):
            return jsonify({"message": "password incorreta"}), 401
        campos_validos["password"] = generate_password_hash(data["password"])

    if not campos_validos:
        return jsonify({"message": "Nenhuma alteração feita."}), 200

    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": campos_validos}) #Atualiza na BD

    novo_username = campos_validos.get("username", user["username"])

    novo_token = jwt.encode({
        "sub": novo_username,
        "id": str(user_id),
        "username": novo_username,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"message": "Dados atualizados com sucesso.", "token": novo_token}), 200

#Iniciar uma compra
@app.route("/user/checkout", methods=["POST"])
@token_required
def iniciar_compra(payload):
    token = request.headers.get('Authorization', '').removeprefix('Bearer ').strip()
    decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    username = decoded.get("sub")

    user = db.users.find_one({"username": username}) #Procura utilizador pelo username
    if not user:
        abort(404, "Utilizador não encontrado")

    data = request.get_json()
    carrinho = data.get("carrinho", []) #Lista de produtos no carrinho
    total = data.get("total", 0)

    if not carrinho:
        abort(400, "Carrinho vazio") #Caso o carrinho não contenha itens

    return jsonify({"message": "Compra registada. Pode avaliar agora.", "carrinho": carrinho, "total": total}), 200

#CHECKOUT

#Confirmar e processar a compra (atualiza stock, histórico e limpa carrinho)
@app.route("/checkout/confirm", methods=["POST"])
@token_required
def confirmar_compra(payload):
    try:
        username = payload.get("sub")
        user_id = payload.get("id")
        user = db.users.find_one({"_id": ObjectId(user_id)})

        if not user:
            abort(404, "Utilizador não encontrado")

        data = request.get_json(force=True)
        carrinho = data.get("carrinho") #Lista de produtos comprados
        total = data.get("total")

        if not isinstance(carrinho, list) or not carrinho:
            abort(400, "Carrinho inválido ou vazio")

        try:
            total = float(total) #Valida que é número, caso não seja retorna erro
        except (TypeError, ValueError):
            abort(400, "Total inválido")

        for item in carrinho:
            if not all(k in item for k in ("id", "tamanho", "quantidade")):
                abort(400, "Item do carrinho incompleto")

            produto = db.products.find_one({"id": item["id"]}) #Verifica se o produto existe 
            if not produto:
                continue

            tamanho = item["tamanho"]
            quantidade = item["quantidade"]

            if tamanho not in produto.get("stock", {}):
                continue #Se o tamanho não existir, continua

            atual = produto["stock"][tamanho] #Stock atual
            novo_stock = max(0, atual - quantidade) #Garante que o stock não fica negativo

            db.products.update_one(
                {"id": item["id"]},
                {"$set": {f"stock.{tamanho}": novo_stock}}
            ) #Atualiza stock

        compra = {
            "data": datetime.utcnow(),
            "itens": carrinho,
            "total": total
        }

        resultado = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$push": {"historico": compra}, #Adiciona compra ao histórico
                "$set": {"carrinho": []} #Limpa o carrinho
            }
        )

        if resultado.modified_count == 0:
            abort(500, "Não foi possível atualizar o histórico")

        return jsonify({"message": "Compra registada com sucesso."}), 200

    except Exception as e:
        print(f"[ERRO] Falha na confirmação da compra: {str(e)}")
        return jsonify({"error": "Erro interno no servidor ao confirmar a compra"}), 500

#PRODUTOS

#Criar novo produto
@app.route("/products", methods=["POST"])
@token_required
def criar_produto(payload):
    #Verifica se o utilizador é administrador
    if payload.get("role") != "admin":
        abort(403, "Apenas administradores podem criar produtos")

    data = request.get_json() or {}

    #Campos obrigatórios para criar um produto
    campos_obrigatorios = ["id", "name", "price", "division", "category", "colors", "stock"]
    if not all(k in data for k in campos_obrigatorios):
        abort(400, f"Campos obrigatórios em falta: {', '.join(campos_obrigatorios)}")

    #Verfica se existe um produto com o mesmo ID
    if db.products.find_one({"id": data["id"]}):
        abort(409, "Produto com este ID já existe")

    #Insere novo produto na BD
    db.products.insert_one(data)
    return jsonify({"message": "Produto criado com sucesso"}), 201

#Obter todos os produtos
@app.route("/products", methods=["GET"]) 
def get_products():
    products = list(db.products.find())
    for doc in products:
        doc["_id"] = str(doc["_id"])
    return jsonify({"total": len(products), "data": products})

#Filtrar produtos por divisão, categoria, cor, tamanho e ordenação
@app.route("/products/filter", methods=["GET"])
def filtrar_produtos():
    try:
        produtos = list(db.products.find()) #Obter todos os produtos da BD
        for p in produtos:
            p["_id"] = str(p["_id"])

        #Receber parâmetros
        divisao = request.args.get("divisão") or request.args.get("divisao")
        categoria = request.args.get("categoria")
        cor = request.args.get("cor")
        tamanho = request.args.get("tamanho")
        ordenar = request.args.get("ordenar")

        #Filtro: Divisão
        if divisao and divisao.lower() != "todas":
            produtos = [p for p in produtos if p.get("divisao", "").lower() == divisao.lower()]

        #Filtro: Categoria
        if categoria and categoria.lower() != "todas":
            produtos = [
                p for p in produtos
                if p.get("categoria", "").strip().lower() == categoria.strip().lower()
            ]

        #Filtro: Tamanho (verifica se existe stock do tamanho especificado)
        if tamanho and tamanho.lower() != "todos":
            produtos = [
                p for p in produtos
                if isinstance(p.get("stock", {}), dict) and p["stock"].get(tamanho, 0) > 0
            ]

        #Filtro: Cor
        cores_validas = [
            "amarelo", "azul", "bege", "branco", "castanho",
            "cinzento", "laranja", "preto", "rosa", "verde"
        ]
        if cor and cor.lower() in cores_validas:
            cor = cor.lower()

            def tem_cor(produto):
                valor_cor = produto.get("cor")
                if isinstance(valor_cor, str) and cor in valor_cor.lower():
                    return True
                if isinstance(valor_cor, list) and any(cor in c.lower() for c in valor_cor):
                    return True

                for variante in produto.get("variantes", []):
                    vcor = variante.get("cor")
                    if isinstance(vcor, str) and cor in vcor.lower():
                        return True
                    if isinstance(vcor, list) and any(cor in c.lower() for c in vcor):
                        return True
                return False

            produtos = [p for p in produtos if tem_cor(p)]

        #Ordenação
        if ordenar == "preco_ascendente":
            produtos.sort(key=lambda p: p.get("price", 0))
        elif ordenar == "preco_descendente":
            produtos.sort(key=lambda p: p.get("price", 0), reverse=True)
        elif ordenar == "avaliacao":
            def media(p):
                reviews = p.get("reviews", [])
                if not reviews:
                    return 0
                return sum(r.get("score", 0) for r in reviews) / len(reviews)
            produtos.sort(key=media, reverse=True)

        return jsonify({"total": len(produtos), "produtos": produtos}) #Retorna produtos filtrados e ordenados

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"erro": "Erro ao aplicar filtros"}), 500

#Criar nova avaliação (review) para um produto
@app.route("/products/<id>/review", methods=["POST"])
@token_required
def criar_review(id, payload):
    
    try:
        produto_id = int(id) #Valida se o ID é um número inteiro
    except ValueError:
        abort(400, "ID inválido")

    data = request.get_json()
    if not data or "score" not in data or "comment" not in data:
        abort(400, "Campos obrigatórios ausentes na criação da review")

    #Obtém o utilizador autenticado
    user_id = payload["id"]
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        abort(404, "Utilizador não encontrado")

    #Nova review
    review = {
        "userId": user_id,
        "name": user.get("username"),
        "score": int(data["score"]),
        "comment": data["comment"]
    }

    #Verifica se o produto existe
    produto = db.products.find_one({"id": produto_id})
    if not produto:
        abort(404, "Produto não encontrado")

    #Verifica se o utilizador já avaliou o produto
    if any(r.get("userId") == user_id for r in produto.get("reviews", [])):
        abort(400, "Review já existente. Use PUT para editar.")

    #Adiciona uma nova review do produto
    db.products.update_one(
        {"id": produto_id},
        {"$push": {"reviews": review}}
    )

    return jsonify({"message": "Avaliação criada com sucesso"}), 201

#Apagar avaliação de um utilizador
@app.route("/products/<id>/review", methods=["DELETE"])
@token_required
def apagar_review(id, payload):
    try:
        produto_id = int(id)
    except ValueError:
        abort(400, "ID inválido")

    user_id = payload["id"]

    #Remove a review do utilizador do produto mencionado
    result = db.products.update_one(
        {"id": produto_id},
        {"$pull": {"reviews": {"userId": user_id}}}
    )

    if result.matched_count == 0:
        abort(404, "Produto não encontrado")
    if result.modified_count == 0:
        abort(404, "Review do utilizador não encontrada") 

    return jsonify({"message": "Review apagada com sucesso"}), 200

#Atualiza o produto
@app.route("/products/<int:produto_id>", methods=["PUT"])
@token_required
def atualizar_produto(produto_id, payload):
    #Verifica se o utilizador tem permissão de administrador
    if payload.get("role") != "admin":
        abort(403, "Apenas administradores podem atualizar produtos")

    data = request.get_json()
    if not data:
        abort(400, "Dados de atualização não fornecidos")

    #Campos que podem ser atualizados
    campos_permitidos = {"name", "price", "description", "category", "division", "image", "stock", "colors"}
    update_fields = {k: v for k, v in data.items() if k in campos_permitidos}

    if not update_fields:
        abort(400, "Nenhum campo válido para atualizar")

    #Atualiza o produto na BD
    result = db.products.update_one(
        {"id": produto_id},
        {"$set": update_fields}
    )

    #Verifica se nenhum foi encontrado com o mesmo ID
    if result.matched_count == 0:
        abort(404, "Produto não encontrado")

    return jsonify({"message": "Produto atualizado com sucesso"}), 200

#Apaga um produto pelo seu ID
@app.route("/products/<int:produto_id>", methods=["DELETE"]) 
@token_required
def apagar_produto(produto_id, payload):
    #Verifica se o utilizador tem permissão de administrador
    if payload.get("role") != "admin":
        abort(403, "Acesso negado — apenas administradores podem eliminar produtos.")
    
    #Tenta eliminar o produto com o ID especificado
    result = db.products.delete_one({"id": produto_id})
    
    #Verifica se algum produto foi realmente eliminado
    if result.deleted_count == 0:
        abort(404, "Produto não encontrado")
    
    return jsonify({"message": f"Produto com id {produto_id} eliminado com sucesso"}), 200

#Atualiza ou adiciona review no produto
@app.route("/products/<int:produto_id>/review", methods=["PUT"])
@token_required
def editar_ou_adicionar_review(payload, produto_id):
    try:
        username = payload.get("username")
        user_id = payload.get("id")
        data = request.get_json()

        print(f"→ DEBUG: Payload PUT recebido: {data}")

        score = data.get("score")
        comment = data.get("comment")

        if score is None or comment is None:
            abort(400, "Campos obrigatórios ausentes na edição da review")

        print(f"→ DEBUG: A tentar atualizar review para: {username} {score} {comment}")

    #Atualiza a review existente
        result = db.products.update_one(
            {"id": produto_id, "reviews.name": username},
            {"$set": {"reviews.$.score": score, "reviews.$.comment": comment}}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Review atualizada com sucesso"}), 200

        #Se não existia, cria uma nova review
        nova_review = {
            "name": username,
            "userId": user_id,
            "score": score,
            "comment": comment
        }

        #Insere a nova review
        insercao = db.products.update_one(
            {"id": produto_id},
            {"$push": {"reviews": nova_review}}
        )

        if insercao.modified_count == 0:
            abort(404, "Produto não encontrado")

        return jsonify({"message": "Review criada com sucesso"}), 201

    except Exception as e:
        print("Erro ao editar ou adicionar review:", e)
        return jsonify({"error": "Erro interno ao processar review"}), 500

#Apagar avaliação como administrador
@app.route("/products/<id>/review/admin", methods=["DELETE"])
@token_required
def apagar_review_admin(id, payload):
    #Verifica se o utilizador tem permissões de administrador
    if payload["role"] != "admin":
        abort(403, "Acesso restrito a administradores")

    try:
        produto_id = int(id)
        data = request.get_json()
        user_id = data.get("userId")

        if not user_id:
            abort(400, "userId é obrigatório")

        #Remove a review do utilizador indicado
        result = db.products.update_one(
            {"id": produto_id},
            {"$pull": {"reviews": {"userId": user_id}}}
        )

        if result.matched_count == 0:
            abort(404, "Produto não encontrado")
        if result.modified_count == 0:
            abort(404, "Review não encontrada ou já eliminada")

        return jsonify({"message": "Review eliminada com sucesso"}), 200

    except Exception as e:
        print("[ERRO] ao apagar review admin:", e)
        return jsonify({"error": "Erro interno"}), 500

#Obter detalhes de um produto pelo ID
@app.route("/products/<int:produto_id>", methods=["GET"])
def obter_detalhes_produto(produto_id):
    try:
        #Procura o produto pelo ID
        produto = db.products.find_one({"id": produto_id})
        if not produto:
            abort(404, "Produto não encontrado")
        
        produto["_id"] = str(produto["_id"])
        return jsonify(produto), 200

    except Exception as e:
        print(f"[ERRO] Falha ao obter produto {produto_id}:", e)
        return jsonify({"error": "Erro interno ao obter produto"}), 500

#Obter avaliações de um produto
@app.route("/products/<int:produto_id>/reviews", methods=["GET"])
def obter_reviews_produto(produto_id):
    try:
        #Procura apenas o campo "reviews" do produto
        produto = db.products.find_one({"id": produto_id}, {"reviews": 1})

        if not produto:
            abort(404, "Produto não encontrado")

        reviews = produto.get("reviews", [])
        return jsonify({"total": len(reviews), "reviews": reviews}), 200

    except Exception as e:
        print(f"[ERRO] Falha ao obter reviews do produto {produto_id}:", e)
        return jsonify({"error": "Erro interno ao obter reviews"}), 500

#Obter stock de um produto
@app.route("/products/<int:produto_id>/stock", methods=["GET"])
def obter_stock_produto(produto_id):
    try:
        #Procura o campo "stock" do produto
        produto = db.products.find_one({"id": produto_id}, {"stock": 1, "_id": 0})

        if not produto:
            abort(404, "Produto não encontrado")

        return jsonify({"stock": produto.get("stock", {})}), 200

    except Exception as e:
        print(f"[ERRO] Erro ao obter stock do produto {produto_id}: {str(e)}")
        abort(500, "Erro interno ao obter stock")

#Atualizar stock de um produto (administrador)
@app.route("/products/<int:produto_id>/stock", methods=["PUT"])
@token_required
def atualizar_stock_produto(payload, produto_id):
    try:
        #Verifica se o utilizador é administrador
        if payload.get("role") != "admin":
            abort(403, "Acesso negado — apenas administradores podem alterar o stock.")

        data = request.get_json()
        if not data or not isinstance(data, dict):
            abort(400, "Dados de stock inválidos")

        atualizacao = {}
        #Valida cada tamanho e quantidade
        for tamanho, quantidade in data.items():
            if not isinstance(quantidade, int) or quantidade < 0:
                abort(400, f"Quantidade inválida para tamanho '{tamanho}'")
            atualizacao[f"stock.{tamanho}"] = quantidade

        #Atualiza o stock do produto
        result = db.products.update_one({"id": produto_id}, {"$set": atualizacao})

        if result.matched_count == 0:
            abort(404, "Produto não encontrado")

        return jsonify({"message": "Stock atualizado com sucesso"}), 200

    except Exception as e:
        print(f"[ERRO] Erro ao atualizar stock do produto {produto_id}:", e)
        return jsonify({"error": "Erro interno ao atualizar stock"}), 500

if __name__ == "__main__":
    app.run(debug=True)
