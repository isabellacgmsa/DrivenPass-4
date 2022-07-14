import jwt from "jsonwebtoken";
import { client } from "../database.js";
import { conflictError, notFoundError, unauthorizedError, unprocessableError } from "../utils/errorUtils.js";
import * as repo from "../repositories/repositorio.js"
import { number } from "joi";


export type CreateSignupData = Omit<repo.UserRepository, "confirmPassword">;
export type CreateLoginData = Omit<repo.UserRepository, "confirmPassword" | "id">;


export async function testeService(password:string, email: string){
    const usuarios = await repo.findUserByEmail(email);
    console.log(usuarios)
    if (!usuarios)
        throw notFoundError()
}

export async function signupService(signupData: CreateSignupData) {
    const usuarioCadastrado = await repo.findUserByEmail(signupData.email)
    if (usuarioCadastrado)
        throw conflictError()
    console.log(signupData)
    const cadastro = await repo.createUser(signupData)
    
}

export async function loginService(loginData:CreateLoginData){
    const loginUsuario = await repo.findUserByEmail(loginData.email)
    if (!loginUsuario)
        throw notFoundError()
    const check = await repo.checkLogin(loginData.password, loginUsuario.password)
    console.log(check)
    if (!check)
        throw unauthorizedError()
    const token = jwt.sign({ userId: loginUsuario.id }, process.env.SECRET);
    return token
}

function validToken(token:string){
    const chave = process.env.SECRET;
    const dados = jwt.verify(token, chave);
    const user = JSON.parse(JSON.stringify(dados))
    const userId:number = user.userId
    return userId
}

export async function createCredentialsService(credentialData:repo.Credential, token:string){
    const userId = validToken(token)
    const findCredential = await repo.findCredentialsByTnr(credentialData.titulo, credentialData.nome, credentialData.rotulo, userId)
    if (findCredential)
        throw conflictError()
    const addCredential = await repo.createCredentials(credentialData, userId)
    return addCredential
}

export async function findAllCredentialsService(token:string){
    // const chave = process.env.SECRET;
    // const dados = jwt.verify(token, chave);
    // const user = JSON.parse(JSON.stringify(dados))
    // const userId:number = user.userId
    const userId = validToken(token)
    const findAll = await repo.findAllCredentials(userId)
    console.log(findAll)
    if (!findAll)
        throw notFoundError()
    return findAll
   
}

export async function findCredentialById(idPass:number, token:string) {
    const userId = validToken(token)
    const findPass = await repo.findCredentialById(userId, idPass)
    if (!findPass)
        throw notFoundError()
    return findPass
}

export async function deleteCredentialById(idPass:number, token:string){
    const userId = validToken(token)
    const deletePass = await repo.deleteCredentialById(userId, idPass)
    if(!deletePass)
        throw notFoundError()
    return deletePass
}











































































