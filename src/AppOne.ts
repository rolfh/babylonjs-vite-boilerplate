// import * as BABYLON from "babylonjs";
import {
	MeshBuilder,
	StandardMaterial,
	Engine,
	Scene,
	ArcRotateCamera,
	Vector3,
	HemisphericLight,
	SceneLoader,
	Color3,
	Color4,
	Texture,
} from 'babylonjs'
// import {SceneLoader} from 'babylonjs-loaders'
import 'babylonjs-loaders'

// import {ImportMeshAsync} from "babylonjs/Meshes/meshImporters/importMeshAsync";

export class AppOne {
	engine: Engine
	scene: Scene

	constructor(readonly canvas: HTMLCanvasElement) {
		this.engine = new Engine(canvas)
		window.addEventListener('resize', () => {
			this.engine.resize()
		})
		this.scene = createScene(this.engine, this.canvas)
	}

	debug(debugOn: boolean = true) {
		if (debugOn) {
			this.scene.debugLayer.show({ overlay: true })
		} else {
			this.scene.debugLayer.hide()
		}
	}

	run() {
		this.debug(true)
		this.engine.runRenderLoop(() => {
			this.scene.render()
		})
	}
}

function createScene(engine: Engine, canvas: HTMLCanvasElement) {
	const scene = new Scene(engine)
	scene.clearColor = new Color4(0, 0, 0, 1)

	// Camera
	const camera = new ArcRotateCamera(
		'ArcRotateCamera',
		Math.PI / 2,
		Math.PI / 2.5,
		10,
		Vector3.Zero(),
		scene,
	)
	camera.setTarget(Vector3.Zero())
	camera.attachControl(canvas, true)

	const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
	light.intensity = 0.7

	const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1, segments: 32 }, scene)
	let startPos = 1
	sphere.position.y = startPos

	const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene)
	const groundMaterial = new StandardMaterial('groundMaterial', scene)
	groundMaterial.diffuseColor = Color3.FromHexString('#80cc80')
	ground.material = groundMaterial
	groundMaterial.bumpTexture = new Texture('./normal.jpg', scene)

	SceneLoader.ImportMeshAsync('', 'models/', 'head1.glb', scene).then((result: any) => {
		console.log('Model loaded:', result.meshes)
		result.meshes[0].position = new Vector3(2, 0, 0)
	})

	const redMaterial = new StandardMaterial('redMaterial', scene)
	redMaterial.diffuseColor = new Color3(1, 0, 0)
	sphere.material = redMaterial

	let sphereVelocity = 0
	const gravity = 0.0049
	const reboundLoss = 0.1

	scene.registerBeforeRender(() => {
		sphereVelocity += gravity
		let newY = sphere.position.y - sphereVelocity
		sphere.position.y -= sphereVelocity
		if (newY < 1) {
			sphereVelocity = (reboundLoss - 1) * sphereVelocity
			newY = 1
		}
		sphere.position.y = newY
		if (Math.abs(sphereVelocity) <= gravity && newY < 1 + gravity) {
			sphere.position.y = startPos++
		}
	})

	return scene
}
