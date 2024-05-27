import { jsPython } from 'jspython-interpreter'
import {AdapterMethodParameters, SourceLandmark} from "../types";
import axios from 'axios'

const PACKAGES = {
  axios: axios,
}

export async function getLandmarks({ boundingBox, boundingCircle, code, variables }: AdapterMethodParameters): Promise<SourceLandmark[]> {
  const interpreter = jsPython()
  interpreter.registerPackagesLoader((packageName) => {
    // @ts-expect-error package has any type, Typescript cannot cast string to package type
    return PACKAGES[packageName]
  })

  interpreter.addFunction('getVariableFromStorage', (variable: unknown) => {
    return variables[variable as string] ?? ''
  })

  return (await interpreter
    .evaluate(code, { boundingBox: boundingBox, boundingCircle: boundingCircle }) as SourceLandmark[])
}

export default { getLandmarks }
