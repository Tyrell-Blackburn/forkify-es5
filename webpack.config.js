const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    
    // Entry file: Where it will start looking for all the dependencies to bundle together. Can specify one or more entry files.
    entry: ['./src/js/index.js'],
    // Where to save the bundle file
    output: { // Webpack will output the file to this parth and to this filename
        // path needs to be an absolute parth, so add the const path = require('path');
        filename: 'js/bundle.js',
        path: path.resolve(__dirname, 'dist'), //__dirname = current absolute path 
    },
    // Production and Development mode
    // Development mode: bundles without minifying the code - faster but more larger.
    // Production mode - minifies the code and file size. 
    // mode: 'development'
    devServer: {
        // this is where the content that the server will host lies
        contentBase: path.join(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
             filename: 'index.html', // the output filename
             template: './src/index.html' // the template to base the HTML file off
        }),
        new MiniCssExtractPlugin ({
            filename: './css/style.css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            // This is not doing anything
            {
                test: /\.(png|svg)$/,
                use: [
                        'file-loader'
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }          
        ]
    }
}