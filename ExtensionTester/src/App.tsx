import React, { useState } from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import { Button, Col, Container, FormControl, FormSelect, Row } from 'react-bootstrap'
import L, { LatLngBounds } from 'leaflet'
import { MapSelector } from './MapSelector.tsx'
import { AdapterProperties, BoundingBox, BoundingCircle } from './types'
import PythonAdapter from './adapter/PythonAdapter.ts'

import 'prismjs/components/prism-python'
import 'prismjs/themes/prism.css'

import 'bootstrap/dist/css/bootstrap.min.css'

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

const adapters: AdapterProperties[] = [
  { name: 'python', executeFn: PythonAdapter.getLandmarks, grammar: Prism.languages.python, language: 'python' },
]

function App() {
  const [code, setCode] = React.useState<string>('')
  const [result, setResult] = React.useState<string>('Result will be shown here')
  const [variables, setVariables] = useState<Record<string, unknown>>({})
  const [currentAdapter, setCurrentAdapter] = useState<AdapterProperties>(adapters[0])

  const runCode = () => {
    const boundingBox = { topLeft: rectangleBounds.getNorthWest(), bottomRight: rectangleBounds.getSouthEast() }
    const boundingCircle = calculateRadiusByBoundingBox(boundingBox)
    currentAdapter.executeFn({ code, variables, boundingBox, boundingCircle })
      .then(value => {
        setResult(JSON.stringify(value, undefined, 2))
      }).catch(error => {
      setResult(error.message)
    })
  }

  const handleAddVariable = () => {
    const newKey = `key${Object.keys(variables).length + 1}`
    setVariables({ ...variables, [newKey]: '' })
  }

  const handleKeyChange = (oldKey: string, newKey: string) => {
    const { [oldKey]: value, ...rest } = variables
    setVariables({ ...rest, [newKey]: value })
  }

  const handleValueChange = (key: string, newValue: unknown) => {
    setVariables({ ...variables, [key]: newValue })
  }

  const currentPosition = { lat: 51.50093, lng: -0.12411 }

  const [rectangleBounds, setRectangleBounds] = useState<LatLngBounds>(
    new L.LatLngBounds(
      [currentPosition.lat - 0.005, currentPosition.lng - 0.005],
      [currentPosition.lat + 0.005, currentPosition.lng + 0.005],
    ),
  )

  function handleRectangleChange(bounds: LatLngBounds) {
    if (bounds) {
      setRectangleBounds(bounds)
    }
  }

  const setAdapter = (name: string) => {
    const newAdapter = adapters.find(adapter => adapter.name === name)
    if (newAdapter) {
      setCurrentAdapter(newAdapter)
    }
  }

  return (
    <Container fluid className="mt-2">
      <div>
        Adapter type:
        <FormSelect value={currentAdapter.name} onChange={event => setAdapter(event.target.value)}>
          {adapters.map(adapter => (
            <option key={adapter.name} value={adapter.name}>{adapter.name}</option>
          ))}
        </FormSelect>
      </div>
      <h2>Variables</h2>
      <Row className="row-cols-6">
        {Object.entries(variables).map(([key, value], index) => (
          <Col key={index} className="mb-2">
            <FormControl
              type="text"
              placeholder="Key"
              value={key}
              onChange={(e) => handleKeyChange(key, e.target.value)}
              className="mb-1"
            />
            <FormControl
              type="text"
              placeholder="Value"
              value={value as string}
              onChange={(e) => handleValueChange(key, e.target.value)}
            />
          </Col>
        ))}
      </Row>
      <Button className="mt-1 btn-info" onClick={handleAddVariable}>+</Button>

      <h3>Code</h3>
      <Row className="border-2 rounded-4 border-black border mx-2 overflow-hidden" style={{ minHeight: '50vh' }}>
        <Editor className={'col col-8 overflow-scroll'}
                value={code}
                onValueChange={(code) => {
                  setCode(code)
                }}
                aria-multiline={true}
                padding={10}
                highlight={code => Prism.highlight(code, currentAdapter.grammar, currentAdapter.language)}
                style={{ maxHeight: '50vh' }} />
        <Col className={'col-4 border-start border-black border-2 px-0'}>
          <MapSelector
            position={currentPosition}
            selection={rectangleBounds}
            handleRectangleChange={handleRectangleChange} />
        </Col>
      </Row>
      <Button className={'mt-2'} onClick={runCode}>Run code</Button>

      <pre className={"border border-2 border-secondary rounded rounded-2 mt-2 mx-2 p-1 bg-light"} style={{ maxHeight: '60vh' }}>
        <code dangerouslySetInnerHTML={{ __html: Prism.highlight(result, Prism.languages.js, 'js') }} />
      </pre>
    </Container>
  )
}

function calculateRadiusByBoundingBox(area: BoundingBox): BoundingCircle {
  const { topLeft, bottomRight } = area
  const { lat: lat1, lng: lng1 } = topLeft
  const { lat: lat2, lng: lng2 } = bottomRight

  const centerLat = (lat1 + lat2) / 2
  const centerLon = (lng1 + lng2) / 2

  const latDelta = lat2 - centerLat
  const lonDelta = lng2 - centerLon
  const radiusDegrees = Math.sqrt(latDelta ** 2 + lonDelta ** 2)

  const radiusKm = (2 * Math.PI * 6371 * radiusDegrees) / 360

  return {
    radius: radiusKm,
    center: { lat: centerLat, lng: centerLon },
  }
}

export default App
