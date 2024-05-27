import {Grammar} from "prismjs";

export type AdapterProperties = {
  name: string
  executeFn: (params: AdapterMethodParameters) => Promise<SourceLandmark[]>,
  grammar: Grammar
  language: string
}

export type AdapterMethodParameters = {
  boundingBox: BoundingBox
  boundingCircle: BoundingCircle
  code: string
  variables: Record<string, unknown>
}

export type BoundingCircle = {
  center: Location
  radius: number
}

export type BoundingBox = {
  topLeft: Location
  bottomRight: Location
}

export type Location = {
  lat: number
  lng: number
}

export type SourceLandmark = {
  lat: number
  lng: number
  name: string
  description: string
  types: string[]
}
