
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
var path=require("path");
var webpack = require("webpack");

const app = [
    './app.js',
];



const devServerHost = '127.0.0.1';
const devServerPort = 8081;

module.exports = {
  "entry": {
    app : app,
  },
  "output": {
    path: path.resolve( __dirname, 'dist' ),
    filename: 'scripts/[name].bundle.js',
    publicPath: '/',
  },
  "module": {
    rules: [
     {
      test: /\.(scss)$/,
      use: [{
        loader: 'style-loader', // inject CSS to page
      }, {
        loader: 'css-loader', // translates CSS into CommonJS modules
      }, {
        loader: 'postcss-loader', // Run postcss actions
        /*
        options: {
          plugins: function () { // postcss plugins, can be exported to postcss.config.js
            return [
              require('autoprefixer')
            ];
          }
        }*/
      }, {
        loader: 'sass-loader' // compiles Sass to CSS
      }]
     },
     {
       test: /\.css$/,
       use: [
         {
           loader: 'file-loader',
           options : {
            outputPath: 'assets/css/',
            //name: '[name].[contenthash].[ext]', 
            name: '[name].[ext]', 
            //name: 'style.css',
            publicPath: 'http://' + devServerHost + ':' + devServerPort + '/assets/css/',
           }
         },
         'extract-loader',
         'css-loader',
         'postcss-loader'
       ]
     },

     {
       test: /\.view$/,
       use: [ './viewloader2.js' ]
     },
     {
       test: /\.(eot|svg|ttf|woff|woff2)$/,
       use: {
         loader: 'file-loader',
         options: {
           outputPath: 'assets/fonts/'
         }
       }
     },
     {
			test:/\.(png|jpg|gif|jpeg)/, //是匹配图片文件后缀名
			use:[{
        		loader:'url-loader', //指定使用的loader和loader的配置参数
        		options:{
            		limit:5*1024,  //是把小于5KB的文件打成Base64的格式，写入JS
            		outputPath: path.resolve( __dirname, 'images')  //打包后的图片放到img文件夹下
            	}
      }]
    }
    ]
  },
  resolve: {
    extensions: [".js"],
    alias: {
      "libq.js" : path.resolve(__dirname, "deps", "libq.js")
    }
  },

  plugins: [
//    new HtmlWebpackPlugin(
      //{
        //filename: './pages/display/display.html',
        //template: '../src/pages/display/display.html',
        //publicPath: '../',
        //inject: false,
      //}
    //),
	  new CopyWebpackPlugin({
      patterns: [
      { from:"./src/manifest.json", to:"." },
      { from:"./src/_locales", to:"_locales" },
      { from:"./src/background", to:"background" },
      { from:"./src/content", to:"content" },
      { from:"./src/popup", to:"popup" },
      { from:"./src/pages", to:"pages" },
      { from:"./src/assets/icons", to:"assets/icons" },
      { from:"./src/assets/images", to:"assets/images" },
      { from:"./src/assets/images", to:"assets/images" },
      { from:"./src/scripts", to:"scripts" },
      //{ from:"./deps/libq.js/dist/assets", to:"assets/libqjs" },
    ]
    })
  ],

  devServer : {
    static : path.resolve( __dirname, 'dist'),
    //contentBase: path.resolve( __dirname, 'dist'),
    //contentBase: path.join(__dirname, ''),
    compress: true,
    host: devServerHost,
    port: devServerPort,
    hot: true,
    headers: {'Access-Control-Allow-Origin': '*' },
  },
  stats : {
    errorDetails: true
  },
}
