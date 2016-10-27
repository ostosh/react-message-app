const express = require('express')
const debug = require('debug')('app:server')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')
const config = require('../config')

const app = express()
const paths = config.utils_paths

const http = require('http');
const socket = require('socket.io');


// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement universal
// rendering, you'll want to remove this middleware.
app.use(require('connect-history-api-fallback')())

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig)

  debug('Enable webpack dev and HMR middleware')
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath  : webpackConfig.output.publicPath,
    contentBase : paths.client(),
    hot         : true,
    quiet       : config.compiler_quiet,
    noInfo      : config.compiler_quiet,
    lazy        : false,
    stats       : config.compiler_stats
  }))
  app.use(require('webpack-hot-middleware')(compiler))

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(paths.client('static')))
} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(paths.dist()))
}

var ADD_USER = 'ADD_USER';
var REMOVE_USER = 'REMOVE_USER';
var RECIEVE_MESSAGE = 'RECIEVE_MESSAGE';

const server = http.Server(app);
const io = socket(server);

io.on('connect', function(socket, a){

  socket.on(ADD_USER, function(data){
    console.log(ADD_USER + ': ' + data.user);
    io.sockets.emit(ADD_USER, {
      user : data.user
    });
  });

  socket.on(REMOVE_USER, function(data){
    console.log(REMOVE_USER + ': ' + data.user);
    io.sockets.emit(REMOVE_USER, {
      user : data.user
    });
  });

  socket.on(RECIEVE_MESSAGE, function(data){
    console.log(RECIEVE_MESSAGE + ': [' + data.author + ']' + data.message)
    io.sockets.emit(RECIEVE_MESSAGE, {
      user    : data.user,
      message : data.message
    });
  });
});

module.exports = server
