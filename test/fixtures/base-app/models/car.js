module.exports = {
    "properties": {
        "make": {
            "type": String,
            "required": true
        },
        "model": {
            "type": String,
            "required": true
        }
    },
    "relations": {
        "dealer": {
            "type": "belongsTo",
            "model": "Dealership",
            "foreignKey": "dealerId"
        }
    }
};