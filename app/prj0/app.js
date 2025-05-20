"use client";

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';

const LerpSpeed = 0.05;
const LedIntensity = 0.05;
const LedDistance = 0.3;
const SelectSpriteScale = 0.15;

/**
 * Dev: Fonction utilitaire pour afficher la hiérarchie d'un objet Three.js, tiré de la doc de Three.js.
 */
function dumpObject(obj, lines = [], isLast = true, prefix = '')
{
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(
        `${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'}[${obj.type}]`
    );
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) =>
    {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

class GeneratorState
{
    constructor(meshes)
    {
        this.buttons = {
            start: {
                name: 'Start_bouton',
                mesh: meshes[5],
                pressed: false,
                originalZ: meshes[5].position.z,
                offset: 0.02
            },
            stop: {
                name: 'Emergency_bouton',
                mesh: meshes[0],
                pressed: false,
                originalZ: meshes[0].position.z,
                offset: 0.02
            },
        };

        this.leds = {
            power: {
                mesh: meshes[3],
                light: new THREE.PointLight(0xFFFF00, LedIntensity, LedDistance)
            },
            on: {
                mesh: meshes[2],
                light: new THREE.PointLight(0x00FF00, LedIntensity, LedDistance)
            },
            error: {
                mesh: meshes[1],
                light: new THREE.PointLight(0xFF0000, LedIntensity, LedDistance)
            },
        };
    }

    Render()
    {
        // Mise à jour de la position des boutons selon leur état logique
        for (const button in this.buttons)
        {
            const btn = this.buttons[button];

            if (btn.pressed)
            {
                btn.mesh.position.z = App.Lerp(btn.mesh.position.z, btn.originalZ - btn.offset, LerpSpeed);
            }
            else
            {
                btn.mesh.position.z = App.Lerp(btn.mesh.position.z, btn.originalZ, LerpSpeed);
            }
        }

        // Logique de l'état des LEDs
        this.leds.power.light.visible = this.buttons.start.pressed;
        this.leds.on.light.visible = this.buttons.start.pressed && !this.buttons.stop.pressed;
        this.leds.error.light.visible = this.buttons.stop.pressed && this.buttons.start.pressed;
    }

    GetButtonByName(name)
    {
        for (const button in this.buttons)
        {
            if (this.buttons[button].name == name)
            {
                return button;
            }
        }

        return null;
    }
}

export default class App
{
    constructor()
    {
        this.generator;
        this.generatorState;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFFFFFF);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 5;

        this.controls = new OrbitControls(this.camera, document.body);
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.target.set(0, 1, 0);
        this.controls.minDistance = 2.0;
        this.controls.maxDistance = 5.0;
        this.controls.update();
        

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.autoClear = false;

        this.light = new THREE.DirectionalLight(0xFFFFFF, 5);
        this.light.position.set(0, 5, 0);
        this.light.castShadow = true;
        this.scene.add(this.light);

        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
        this.scene.add(this.ambientLight);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.intersected;
        this.selectSprite;

        this.AddPlane();
        this.AddModel();
        this.AddSprite();
    }

    AddPlane()
    {
        const planeGeometry = new THREE.PlaneGeometry(5, 5);
        const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, side: THREE.BackSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;

        // Rotation de 90 degrés sur l'axe X pour mettre le plan à l'horizontale
        plane.rotation.x = Math.PI / 2;

        this.scene.add(plane);
    }

    AddModel()
    {
        // Draco est nécessaire pour charger le modèle, qui est compressé
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        // Chargement du modèle
        loader.load('/mdls/generator.glb', (gltf) =>
        {
            const root = gltf.scene;
            console.log(dumpObject(root).join('\n'));

            this.scene.add(root);
            this.generator = root.getObjectByName('Base_generator');
            this.generator.castShadow = true;

            this.generatorState = new GeneratorState(this.generator.children);

            this.AddLensflare();
        }, undefined, (error) =>
        {
            console.error(error);
        });
    }

    AddLensflare()
    {
        const textureLoader = new THREE.TextureLoader();
        const textureFlare0 = textureLoader.load('/tex/lensFlare.png');

        for (const ledName in this.generatorState.leds)
        {
            const led = this.generatorState.leds[ledName];

            const lensflare = new Lensflare();
            lensflare.addElement(new LensflareElement(textureFlare0, 64, 0, led.light.color));
            led.light.add(lensflare);

            const targetPos = led.mesh.position;
            led.light.position.set(targetPos.x, targetPos.y + 1.06, targetPos.z + 0.025);

            this.scene.add(led.light);
        }
    }

    AddSprite()
    {
        const map = new THREE.TextureLoader().load('/tex/select.png');
        const material = new THREE.SpriteMaterial({ map: map });

        this.selectSprite = new THREE.Sprite(material);
        this.selectSprite.scale.set(SelectSpriteScale, SelectSpriteScale, SelectSpriteScale);
        this.selectSprite.visible = false;
    }

    HandleMouseClick()
    {
        if (this.intersected)
        {
            const btn = this.generatorState.GetButtonByName(this.intersected.name);

            if (btn)
            {
                this.generatorState.buttons[btn].pressed = !this.generatorState.buttons[btn].pressed;
            }
        }
    }

    HandleMouseMove(event)
    {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    HandleResize()
    {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    Render()
    {
        // S'assure que le modèle est chargé avant de continuer
        if (!this.generator)
        {
            this.renderer.clear();
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // S'occupe de la logique de la position du bouton
        //this.generator.children[0].position.z = App.Lerp(this.generator.children[0].position.z, targetZ, 0.05);
        this.generatorState.Render();


        // S'occupe du raycasting
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.generator.children, false);

        if (intersects.length > 0)
        {
            if (this.intersected != intersects[0].object)
            {
                this.intersected = intersects[0].object;

                if (this.intersected.name != 'réservoir' && !this.intersected.name.startsWith('Led'))
                {
                    this.SetMouseCursorPointer(true);
                    this.selectSprite.position.set(this.intersected.position.x, this.intersected.position.y + 1.055, this.intersected.position.z + 0.01);
                    this.selectSprite.visible = true;
                }
            }
        }
        else
        {
            if (this.intersected)
            {
                this.SetMouseCursorPointer(false);
                this.selectSprite.visible = false;
            }

            this.intersected = null;

        }

        // Update de la caméra
        this.controls.update();

        // Rendu de la scène
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);

        // Rendu du sprite de sélection par dessus le reste de la scène
        this.renderer.clearDepth();
        this.renderer.render(this.selectSprite, this.camera);
    }

    /**
     * Définit l'état du curseur de la souris sur "pointer" ou "default"
     * @param {boolean} state Si vrai, le curseur sera "pointer", sinon ce sera le pointeur par défaut.
     */
    SetMouseCursorPointer(state)
    {
        if (state)
        {
            document.body.style.cursor = 'pointer';
        }
        else
        {
            document.body.style.cursor = 'default';
        }
    }

    /**
     * Fonction de lerp générique pour interpoler entre deux valeurs.
     * @param {*} a Origine
     * @param {*} b Destination
     * @param {*} t Etape d'intérpolation
     * @returns {*} Valeur interpolée entre a et b
     */
    static Lerp(a, b, t)
    {
        return a + (b - a) * t;
    }
}
