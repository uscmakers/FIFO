from flask import Flask, jsonify, request
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

app = Flask(__name__)

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "Flask Firebase API is running"
    }), 200


@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({
        "success": True,
        "message": "Test route works"
    }), 200


@app.route("/api/users/<user_id>/products", methods=["GET"])
def get_all_products(user_id):
    try:
        docs = db.collection("users").document(user_id).collection("products").stream()

        products = []
        for doc in docs:
            product_data = doc.to_dict()
            product_data["id"] = doc.id
            products.append(product_data)

        return jsonify({
            "success": True,
            "userId": user_id,
            "products": products
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/users/<user_id>/products/<product_id>", methods=["GET"])
def get_product(user_id, product_id):
    try:
        doc_ref = db.collection("users").document(user_id).collection("products").document(product_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({
                "success": False,
                "error": "Product not found"
            }), 404

        product_data = doc.to_dict()
        product_data["id"] = doc.id

        return jsonify({
            "success": True,
            "product": product_data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/users/<user_id>/products/<product_id>", methods=["POST"])
def create_or_update_product(user_id, product_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON body provided"
            }), 400

        required_fields = ["name", "brand", "category", "expirationDate", "imageUrl"]
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing field: {field}"
                }), 400

        doc_ref = db.collection("users").document(user_id).collection("products").document(product_id)
        existing_doc = doc_ref.get()

        timestamp = now_iso()

        product_data = {
            "id": product_id,
            "name": data.get("name", ""),
            "brand": data.get("brand", ""),
            "category": data.get("category", ""),
            "expirationDate": data.get("expirationDate", ""),
            "imageUrl": data.get("imageUrl", ""),
            "addedAt": existing_doc.to_dict().get("addedAt") if existing_doc.exists else timestamp,
            "updatedAt": timestamp
        }

        doc_ref.set(product_data, merge=True)

        return jsonify({
            "success": True,
            "message": "Product saved successfully",
            "productId": product_id,
            "userId": user_id
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/users/<user_id>/products/<product_id>", methods=["DELETE"])
def delete_product(user_id, product_id):
    try:
        doc_ref = db.collection("users").document(user_id).collection("products").document(product_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({
                "success": False,
                "error": "Product not found"
            }), 404

        doc_ref.delete()

        return jsonify({
            "success": True,
            "message": "Product deleted successfully",
            "productId": product_id
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)