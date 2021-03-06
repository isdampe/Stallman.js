var net = require("net");
var request = require("request");
var Email = require('email').Email;

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
    var reg = new RegExp("\r\n",'g');
    email = email.replace(reg,'');

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

      body = body + "\r\n\r\nI am careful in how I use the Internet. I generally do not connect to web sites from my own machine, aside from a few sites I have some special relationship with. I usually fetch web pages from other sites by sending mail to a program (see git://git.gnu.org/womb/hacks.git) that fetches them, much like wget, and then mails them back to me. Then I look at them using a web browser, unless it is easy to see the text in the HTML page directly. I usually try lynx first, then a graphical browser if the page needs it (using konqueror, which won't fetch from other sites in such a situation).\r\n\r\nhttps://stallman.org/stallman-computing.html";

      var myMsg = new Email({
        from: "richard@stallman.org",
        to: email,
        subject: "Your HTML data from Richard Stallman",
        body: body
      });

      myMsg.send(function(err){
        if ( err ) {
          socket.write("Error sending mail\r\n");
          console.log(err);
        }
      });

      socket.write("Your HTML data has been delivered to your email inbox.\r\n");
      socket.write("If you run a commercial non-free mail filter, you will need to check your spam folder.\r\n");

    });


  } else {
    socket.write("You are using non-free software.\r\n");
    socket.write("Syntax: url::email\r\n");
  }

};
