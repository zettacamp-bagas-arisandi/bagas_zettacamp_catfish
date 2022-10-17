function test1(a,b){
    return a + b;
}

async function tes2t(a,b){
    let result = await test1(2,3)
    console.log(result)
}

tes2t()