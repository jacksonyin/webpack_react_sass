const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const { spawn } = require('child_process');

// Config directories
const SRC_DIR = path.resolve(__dirname, 'src');
const OUTPUT_DIR = path.resolve(__dirname, 'dist');

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = [SRC_DIR];

const configBase = {
    entry: SRC_DIR + '/index.jsx',
    output: {
        path: OUTPUT_DIR,
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [{ loader: 'babel-loader' }],
                include: defaultInclude
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                exclude: /node_modules/,
                use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
                include: defaultInclude
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                exclude: /node_modules/,
                use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
                include: defaultInclude
            },
            {
                test: /\.html$/,
                use: [{ loader: "html-loader" }],
                include: defaultInclude
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss', 'css']
    },
    plugins: [
        new HtmlWebPackPlugin({
            filename: "./index.html",
            template: "./src/index.html",
        })
    ],
};
const configDev = {
    ...configBase,
    module: {
        ...configBase.module,
        rules: [
            ...configBase.module.rules,
            {
                test: /\.(scss|css)$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
        ]
    },
    devtool: 'cheap-module-source-map',
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        contentBase: OUTPUT_DIR,
        inline: true,
        hot: true,
        stats: {
            colors: true,
            chunks: false,
            children: false
        },
    },
};
const configDevElectron = {
    ...configDev,
    target: 'electron-renderer',
    devServer: {
        ...configDev.devServer,
        setup() {
            spawn(
                'electron',
                ['.'],
                { shell: true, env: process.env, stdio: 'inherit' }
            )
                .on('close', code => process.exit(0))
                .on('error', spawnError => console.error(spawnError));
        }
    },
};
const configProdElectron = {
    ...configBase,
    target: 'electron-renderer',
    module: {
        ...configBase.module,
        rules: [
            ...configBase.module.rules,

            {
                test: /\.(scss|sass|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            // Prefer `dart-sass`
                            implementation: require('sass'),
                        },
                    }
                ],
            },
        ]
    },
    plugins: [
        ...configBase.plugins,
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'bundle.css',
          }),
        new BabiliPlugin(),
    ],
};

module.exports = {
    configDev,
    configDevElectron,
    configProdElectron,
};
