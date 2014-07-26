module.exports = function (t) {
    return {
        "curd": true,
        "properties": {
            "make": {
                "type": String,
                "required": true
            },
            "model": {
                "type": String,
                "required": true
            },
            "desc": t.Text
        },
        "relations": {
            "dealer": {
                "type": "belongsTo",
                "model": "Dealership",
                "foreignKey": "dealerId"
            }
        }
    }
};