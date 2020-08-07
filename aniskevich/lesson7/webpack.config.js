const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
    template: path.resolve(__dirname, 'client', 'index.html'), 
    filename: 'index.html',
})

const miniCssPlugin = new MiniCssExtractPlugin({
    filename: 'style.css',
})

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, 'client', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    plugins: [
        htmlPlugin,
        miniCssPlugin,
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    },
                },
            },
            {
                test: /\.module\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { 
                            modules: true,
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader'
            },
        ],
    },
    devServer: {
        port: 8080,
        historyApiFallback: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
            },
        }
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss'],
        alias: {
            reducers: path.resolve(__dirname, 'client', 'reducers'),
            api: path.resolve(__dirname, 'client', 'api'),
            components: path.resolve(__dirname, 'client', 'components'),
            common: path.resolve(__dirname, 'client', 'common'),
        },
    },
}