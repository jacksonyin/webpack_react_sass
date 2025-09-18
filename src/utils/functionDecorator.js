// Decorator function
function gfg(target, name, descriptor) {
  var fn = descriptor.value;
 
  // Checks if "descriptor.value"
  // is a function or not
  if (typeof fn == 'function') {
    descriptor.value = function(...args) {
  
      // Document.write(`parameters: ${args}`+"<br>");
      console.log(`parameters: ${args}`);
      var result = fn.apply(this, args);
  
      // Document.write(`addition: ${result}`);
  
      // Print the addition of passed arguments
      console.log(`addition: ${result}`);
                  
      return result;
    }
  }
  return descriptor;
 }

 class geek {
   @gfg
   add(a, b) {
    return a+b;
   }
 }

var e = new geek();
e.add(100, 200);