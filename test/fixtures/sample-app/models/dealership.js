module.exports = {
    "name": "Dealership",
    extend: "Base",
    "properties": {
        "name": String,
        "zip": Number,
        "address": String
    },
    "relations": {
        "cars": {
            "type": "hasMany",
            "model": "Car",
            "foreignKey": "dealerId"
        }
    }
};