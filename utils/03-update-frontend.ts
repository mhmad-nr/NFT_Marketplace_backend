import {  frontEndAbiLocation } from "../helper-hardhat-config"
import fs from "fs"

const updateFrontEnd = async function (name: string, abi: any, address: string) {
    const path = `${frontEndAbiLocation}${name}.json`
    const data = {
        abi,
        address
    }
    fs.writeFileSync(path, JSON.stringify(data))

}

export default updateFrontEnd