var net = require("net");
var request = require("request");
var sendmail = require("sendmail");

var server = net.createServer(function(c) {

  c.on("data", function(buffer){
    var command = buffer.toString("utf8");
    doCommand(command, c);
  });

});

server.listen(23, function() {
  console.log('Listening');
});

var doCommand = function(command, socket) {

  var buf = command.split("::"), url, email;

  if ( buf.length >= 2 ) {

    url = buf[0];
    email = buf[1];
    socket.write("Fetching your data now.\r\n");

    request(url, function(err,res,body){
      if ( err ) {
        socket.write("An error occured.\r\n");
        return false;
      }
      if (res.statusCode !== 200) {
        socket.write("The URL you entered is invalid.\r\n");
        return false;
      }

      socket.write("Data found.\r\nSending your data via email now.\r\n");

      //Send email with data.
      sendmail({
          from: 'richard@stallman.org',
          to: email,
          subject: 'Your HTML data from Richard Stallman',
          content: body,
        }, function(err, reply) {
          if ( err ) {
            console.log(err);
            socket.write("Error sending email\r\n");
            socket.write(err);
          } else {
            socket.write("Your HTML data has been delivered to your email inbox.\r\n");
            socket.write("If you run a commercial non-free mail filter, you will need to check your spam folder.\r\n");
          }

          return true;
      });

    });


  } else {
    socket.write("You are using non-free software.\r\n");
    socket.write("Syntax: url::email\r\n");
  }

};
