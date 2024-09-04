
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
var path=require("path");
var webpack = require("webpack");

const app = [
    //'../../../src/Q.js',
    //'../deps/libq.js/Q.debug.js',
    './app.js',
    //'whatwg-fetch',
];



const devServerHost = '127.0.0.1';
const devServerPort = 8081;

module.exports = {
  "entry": {
    app : app,
  },
  "output": {
    path: path.resolve( __dirname, '../dist' ),
    filename: 'scripts/[name].bundle.js',
    publicPath: '/',
  },
  "module": {
    rules: [
     {
       test: /\.scss$/,
       use: [ { 
           loader: 'sass-loader' 
       }] 
     },
     {
       test: /\.css$/,
       use: [
         {
           loader: 'file-loader',
           options : {
            outputPath: 'css/',
            //name: '[name].[contenthash].[ext]', 
            //name: '[name].[ext]', 
            name: 'style.css',
            publicPath: 'http://' + devServerHost + ':' + devServerPort + '/css/',
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
           outputPath: 'fonts/'
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
    extensions: [".js"]
  },

  plugins: [
    new HtmlWebpackPlugin(
      {
        filename: './display.html',
        template: '../src/display.html',
        publicPath: '../',
        inject: false,
        
      }
    ),
	  new CopyWebpackPlugin({
      patterns: [
      {
        from:"../src/manifest.json", to:"." 
      },
      {
        from:"../src/_locales", to:"_locales" 
      },
//      {
        //from:"../deps/libq.js/css",// 指定要拷贝的目录
        //to:"libqjs/css" // 指定输出目录，会在output中指定的目录下生成
      //},
//      {
        //from:"../deps/libq.js/images",// 指定要拷贝的目录
        //to:"libqjs/images" // 指定输出目录，会在output中指定的目录下生成
      //}


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
