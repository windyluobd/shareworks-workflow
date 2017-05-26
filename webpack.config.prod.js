module.exports = {
    entry: {
		"main": __dirname + "/src/main.js"
	},
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
				exclude: /node_modules/,
                loader: 'babel-loader',
				query: {presets: ['es2015']}
            },
            {
                test: /\.css$/,
                loader: 'css-loader'
            }
        ],
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'jshint-loader',
                options: {
                    camelcase: true,
                    bitwise: true,
                    curly: true,
                    esversion: 6,
                    funcscope: false,
                    indent: 4,
                    maxdepth: 10,
                    nonbsp: true,
                    undef: true,
                    unused: true,
                    lastsemic: true,
                    devel:true,
                    evil: true,
                    validthis: true,
                    browser: true,
					loopfunc: true
                }
            }
        ]
    }
};