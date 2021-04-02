const path = require("path");
module.exports = {
    entry : "./src/index.js",
    mode : "development",
    output : {
        filename : "main.js",
        path : path.join(__dirname, "dist"),
        publicPath : "/assets/"
    },

    devServer : {
        contentBase: path.join(__dirname, 'public'),
        port : "3000"
    },

    module : {
        rules : [
            {
                test : /\.m?js$/,
                exclude : /(node_modules|bower_components)/,
                use : {
                    loader : "babel-loader",
                    options : {
                        presets : ["@babel/preset-react"]
                    }
                }
            }
        ]
    }
}