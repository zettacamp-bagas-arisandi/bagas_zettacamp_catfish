const { merge } = require('lodash')

//// resolver di file user
const resolverUser = {
   
        query: 'Bagas'
    
}

const resolverIngredients = {
    
        query: 'Bagas lagi'
    
}

/// ini di file server
resolver = merge(
         resolverUser,
        resolverIngredients
)

console.log(resolver)
