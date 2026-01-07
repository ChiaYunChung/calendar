let aaaaa=console.log('aaaaa')

function a(a){
    console.log("bbbbb")
}

let aa=function(a){
    console.log("ccccc")
}
let bb=(a)=>{console.log('aaaaa')}
a()
aa()
bb()

function add(a,b)
{
    return a+b
}

function add2(b)
{
    return add(2,b)
}
b=4
console.log(add2(2))

let arr=[1,2,3,4]
function foo(x)
{
    x=x+2;
    if(x%2===0)
    {
        return false;
    }
    else{
        return true
    }
}
arr=arr.map((x)=>foo(x))
console.log(arr)