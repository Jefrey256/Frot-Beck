import fs from "fs"
import readline from "readline/promises"


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (text): Promise <string>=>{
  return new Promise((resolve)=>{
    rl.question(text.resolve)
  })

}

export  {question}
