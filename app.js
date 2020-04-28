var port = process.env.PORT || 3000,
    http = require('http'),
    url = require("url"),
    path = require("path"),
    fs = require('fs'),
    mime = require('mime-types');

// node server.js
const exec = require('child_process').exec;
exec('node ' + __dirname + '/jspm_packages/github/muaz-khan/RTCMultiConnection*/server.js bad_file | wc -l', {env: {number: 1234}}, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
console.log('socket.io is listening at: http://127.0.0.1:9001/');

var log = function(entry) {
    fs.appendFileSync('/tmp/webrtc.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        req.url = req.url.indexOf('.') === -1 ? req.url + 'index.html' : req.url;
        var uri = url.parse(req.url).pathname, filename = path.join(process.cwd(), uri);

        fs.exists(filename, function(exists) {
            if(!exists) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.write("404 Not Found\n");
                res.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) filename += '/index.html';

            fs.readFile(filename, "binary", function(err, file) {
                if(err) {
                    res.writeHead(500, {"Content-Type": "text/plain"});
                    res.write(err + "\n");
                    res.end();
                    return;
                }

                res.setHeader("Content-Type", mime.lookup(req.url));
                res.writeHead(200);
                res.write(file, "binary");
                res.end();
            });
        });
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');