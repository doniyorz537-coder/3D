/* ============================================= */
/* MAIN VARIABLES AND INITIALIZATION */
/* ============================================= */

let scene, camera, renderer, controls;
const planets = [];
const textureLoader = new THREE.TextureLoader();
let asteroidBelt, kuiperBelt;
let loadingComplete = false;
let texturesToLoad = 0;
let loadedTextures = 0;
let currentTourIndex = 0;
let isTourActive = false;
let autoRotate = true;
let realScaleMode = false;
let vrEnabled = false;
let vrButton;
let effect, controlsVR;
let lastClickTime = 0;
let selectedPlanet = null;
let isPaused = false;
let tourTimeout = null;
let activeSpeechAudio = null;
let activeSpeechRequest = null;
let activeSpeechRequestId = 0;
let activeSpeechObjectUrl = null;

// Base path for textures
const TEXTURE_BASE_PATH = 'public/textures/';

const tourSequence = [
    'Sol (The Sun)', 
    'Mercury',
    'Venus',
    'Earth (Terra)',
    'Luna (The Moon)',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
    'Ceres'
];

const localizedPlanetNames = {
    'Sol (The Sun)': 'Quyosh',
    'Mercury': 'Merkuriy',
    'Venus': 'Venera',
    'Earth (Terra)': 'Yer',
    'Luna (The Moon)': 'Oy',
    'Mars': 'Mars',
    'Jupiter': 'Yupiter',
    'Saturn': 'Saturn',
    'Uranus': 'Uran',
    'Neptune': 'Neptun',
    'Pluto': 'Pluton',
    'Ceres': 'Serera'
};

function getLocalizedPlanetName(planet) {
    return localizedPlanetNames[planet.name] || planet.name;
}

const planetData = [
    { 
        name: 'Sol (The Sun)', 
        size: 100, 
        realSize: 1391400,
        texture: 'sun.jpg', 
        color: 0xffff33,
        type: 'G sinfiga mansub asosiy ketma-ketlik yulduzi',
        diameter: '1 391 400 km',
        distance: '0 km (Quyosh tizimining markazi)',
        period: 'Mavjud emas (Galaktika markazini taxminan 230 million yilda aylanib chiqadi)',
        rotation: '25–35 kun (turli kengliklarda har xil tezlikda aylanadi)',
        moons: 0,
        atmosphere: 'Vodorod (73%), geliy (25%) va boshqa elementlar (2%)',
        temperature: 'Yuzasida 5 500°C, yadrosida 15 000 000°C',
        fact: 'Quyosh Quyosh tizimi massasining 99,86 foizini tashkil qiladi. Uning ichiga taxminan 1,3 millionta Yer sig‘adi.',
        audioDescription: 'Quyosh — Quyosh tizimining markazida joylashgan, asosan vodorod va geliydan tarkib topgan ulkan, qaynoq plazma sharidir. U sayyoralarimizga yorug‘lik va issiqlik beradi hamda Quyosh tizimi massasining qariyb 99,86 foizini tashkil qiladi.',
        labelColor: '#FFD700'
    },
    { 
        name: 'Mercury', 
        size: 3.8, 
        realSize: 4880,
        a: 140, 
        b: 138, 
        speed: 4.15, 
        tilt: 0, 
        color: 0xCCCCCC, 
        texture: 'mercury.jpg',
        type: 'Toshli sayyora',
        diameter: '4 880 km',
        distance: 'Quyoshdan 57,9 million km',
        period: '88 Yer kuni',
        rotation: '59 Yer kuni',
        moons: 0,
        atmosphere: 'Juda siyrak: vodorod, geliy va kislorod',
        temperature: '−173°C dan 427°C gacha',
        fact: 'Merkuriyda kecha va kunduz haroratlari keskin farq qiladi. Sayyora yadrosi sovib borayotgani sababli u asta-sekin kichraymoqda.',
        audioDescription: 'Merkuriy — Quyoshga eng yaqin va Quyosh tizimidagi eng kichik sayyora. Unda atmosfera deyarli yo‘q, shu sababli kunduzlari juda issiq, tunlari esa nihoyatda sovuq bo‘ladi.',
        labelColor: '#A9A9A9'
    },
    { 
        name: 'Venus', 
        size: 9.5, 
        realSize: 12104,
        a: 200, 
        b: 198, 
        speed: 1.62, 
        tilt: 177, 
        color: 0xFF9933, 
        texture: 'venus.jpg',
        type: 'Toshli sayyora',
        diameter: '12 104 km',
        distance: 'Quyoshdan 108,2 million km',
        period: '225 Yer kuni',
        rotation: '243 Yer kuni (boshqa sayyoralarga teskari yo‘nalishda)',
        moons: 0,
        atmosphere: '96,5% karbonat angidrid, 3,5% azot; qalin sulfat kislota bulutlari',
        temperature: 'Taxminan 462°C (eng issiq sayyora)',
        fact: 'Venera o‘z o‘qi atrofida ko‘pchilik sayyoralarga teskari yo‘nalishda aylanadi. Uning bir kuni bir yilidan uzun, sirtidagi bosim esa Yernikidan 92 baravar yuqori.',
        audioDescription: 'Venera ko‘pincha Yerning egizagi deb ataladi, chunki ularning o‘lchamlari o‘xshash. Biroq Veneraning juda qalin atmosferasi issiqlikni tutib qoladi va kuchli issiqxona effektini yuzaga keltiradi. Shu sababli u Quyosh tizimidagi eng issiq sayyoradir.',
        labelColor: '#FFA07A'
    },
    { 
        name: 'Earth (Terra)', 
        size: 10, 
        realSize: 12742,
        a: 260, 
        b: 258, 
        speed: 1, 
        tilt: 23.4, 
        color: 0x3366FF, 
        texture: 'earth.jpg',
        type: 'Toshli sayyora',
        diameter: '12 742 km',
        distance: 'Quyoshdan 149,6 million km (1 astronomik birlik)',
        period: '365,25 kun',
        rotation: '23 soat 56 daqiqa',
        moons: 1,
        atmosphere: '78% azot, 21% kislorod va 1% boshqa gazlar',
        temperature: '−89°C dan 58°C gacha',
        fact: 'Yer — sirtida suyuq suv mavjudligi ma’lum bo‘lgan yagona sayyora. U Quyosh tizimidagi eng zich sayyora hamdir.',
        audioDescription: 'Yer — bizning uyimiz va hozircha hayot mavjudligi ma’lum bo‘lgan yagona sayyora. Uning sirtining qariyb 71 foizini okeanlar qoplaydi. Suyuq suv, hayot uchun qulay harorat va kislorodga boy atmosfera millionlab turdagi tirik organizmlarning yashashiga imkon beradi. Yer Quyosh atrofini 365 kun-u taxminan 6 soatda aylanib chiqadi, o‘z o‘qi atrofida esa qariyb 24 soatda bir marta aylanadi. Uning bitta tabiiy yo‘ldoshi — Oy bor.',
        labelColor: '#1E90FF'
    },
    { 
        name: 'Luna (The Moon)', 
        size: 2.7, 
        realSize: 3474,
        a: 30, 
        b: 29, 
        speed: 12, 
        parent: 'Earth (Terra)', 
        color: 0xAAAAAA, 
        texture: 'moon.jpg',
        type: 'Tabiiy yo‘ldosh',
        diameter: '3 474 km',
        distance: 'Yerdan o‘rtacha 384 400 km',
        period: '27,3 Yer kuni',
        rotation: '27,3 kun (Yerga doim bir tomoni qarab turadi)',
        moons: 0,
        atmosphere: 'Juda siyrak ekzosfera',
        temperature: '−173°C dan 127°C gacha',
        fact: 'Oy Yerdan har yili taxminan 3,8 santimetr uzoqlashmoqda. Unda oy zilzilalari sodir bo‘ladi, Yerga qaragan tomonidagi qobig‘i esa nisbatan yupqaroq.',
        audioDescription: 'Oy — Yerning yagona tabiiy yo‘ldoshi. U o‘z o‘qi atrofida aylanishi va Yer atrofini aylanib chiqishi uchun deyarli bir xil vaqt sarflaydi, shu sababli biz Oyning doimo bir tomonini ko‘ramiz. Oy yuzasida havo deyarli yo‘q va odamlar unga qadam qo‘ygan.',
        labelColor: '#B0C4DE'
    },
    { 
        name: 'Mars', 
        size: 5.3, 
        realSize: 6779,
        a: 320, 
        b: 315, 
        speed: 0.53, 
        tilt: 25, 
        color: 0xFF3300, 
        texture: 'mars.jpg',
        type: 'Toshli sayyora',
        diameter: '6 779 km',
        distance: 'Quyoshdan 227,9 million km',
        period: '687 Yer kuni',
        rotation: '24 soat 37 daqiqa',
        moons: 2,
        atmosphere: '95% karbonat angidrid, 3% azot va 1,6% argon',
        temperature: '−140°C dan 20°C gacha',
        fact: 'Marsda Quyosh tizimidagi eng baland vulqon — Olimp tog‘i (21 km) va eng ulkan kanyonlardan biri — Mariner vodiylari joylashgan.',
        audioDescription: 'Mars temir oksidiga boy tuprog‘i sababli Qizil sayyora deb ataladi. Unda Quyosh tizimidagi eng yirik chang bo‘ronlari kuzatiladi. Olimlar Marsda qadimda suyuq suv bo‘lganiga oid dalillarni topgan, shu bois sayyora kelajakdagi tadqiqotlar uchun muhim manzildir.',
        labelColor: '#FF6347'
    },
    { 
        name: 'Jupiter', 
        size: 56.5, 
        realSize: 139820,
        a: 420, 
        b: 415, 
        speed: 0.084, 
        tilt: 3, 
        color: 0xFFCC99, 
        texture: 'jupiter.jpg',
        type: 'Gaz giganti',
        diameter: '139 820 km',
        distance: 'Quyoshdan 778,3 million km',
        period: '11,86 Yer yili',
        rotation: '9 soat 55 daqiqa (eng tez aylanuvchi sayyora)',
        moons: 79,
        atmosphere: '90% vodorod, 10% geliy; ammiak bulutlari',
        temperature: 'Bulutlar tepasida taxminan −145°C',
        fact: 'Yupiterdagi Katta Qizil Dog‘ kamida 400 yildan beri davom etayotgan ulkan bo‘rondir. Uning kattaligi Yernikidan ham katta.',
        audioDescription: 'Yupiter — Quyosh tizimidagi eng katta sayyora va gaz giganti. Uning atmosferasidagi Katta Qizil Dog‘ — yuzlab yillardan beri davom etayotgan, Yerdan ham katta ulkan bo‘ron. Yupiterning ko‘plab yo‘ldoshlari bor.',
        labelColor: '#F4A460'
    },
    { 
        name: 'Saturn', 
        size: 47.5, 
        realSize: 116460,
        a: 520, 
        b: 515, 
        speed: 0.034, 
        tilt: 26, 
        ring: true, 
        color: 0xFFFF99, 
        texture: 'saturn.jpg', 
        ringTexture: 'saturn_rings.png',
        innerRingRadius: 60,
        outerRingRadius: 100,
        ringTilt: 27,
        type: 'Gaz giganti',
        diameter: '116 460 km',
        distance: 'Quyoshdan 1,4 milliard km',
        period: '29,5 Yer yili',
        rotation: '10 soat 33 daqiqa',
        moons: 82,
        atmosphere: '96% vodorod, 3% geliy va ammiak bulutlari',
        temperature: 'Bulutlar tepasida taxminan −178°C',
        fact: 'Saturn halqalari asosan muz bo‘laklari va toshlardan iborat. Uning o‘rtacha zichligi suvnikidan past.',
        audioDescription: 'Saturn o‘zining ko‘zga yaqqol tashlanadigan halqalari bilan mashhur. Halqalar asosan muz bo‘laklari, shuningdek, tosh va chang zarralaridan tashkil topgan. Saturn — Quyosh tizimidagi ikkinchi eng katta sayyora va gaz giganti.',
        labelColor: '#DAA520'
    },
    { 
        name: 'Uranus', 
        size: 20.2, 
        realSize: 50724,
        a: 620, 
        b: 615, 
        speed: 0.011, 
        tilt: 98, 
        ring: true,
        color: 0x99FFFF, 
        texture: 'uranus.jpg',
        ringTexture: 'uranus_rings.png',
        innerRingRadius: 30,
        outerRingRadius: 50,
        ringTilt: 98,
        type: 'Muz giganti',
        diameter: '50 724 km',
        distance: 'Quyoshdan 2,9 milliard km',
        period: '84 Yer yili',
        rotation: '17 soat 14 daqiqa (teskari yo‘nalishda)',
        moons: 27,
        atmosphere: '83% vodorod, 15% geliy va 2% metan',
        temperature: '−224°C gacha (eng sovuq sayyora)',
        fact: 'Uran o‘z o‘qi atrofida deyarli yonboshlab aylanadi: o‘qining qiyaligi 98 daraja. U teleskop yordamida kashf etilgan birinchi sayyora.',
        audioDescription: 'Uran muz giganti bo‘lib, o‘z o‘qi atrofida deyarli yonboshlab aylanadi. Olimlarning fikricha, bunga sayyora tarixining ilk davrida yuz bergan ulkan to‘qnashuv sabab bo‘lgan. Uran atmosferasidagi metan unga moviy-yashil tus beradi.',
        labelColor: '#AFEEEE'
    },
    { 
        name: 'Neptune', 
        size: 19.2, 
        realSize: 49244,
        a: 700, 
        b: 695, 
        speed: 0.006, 
        tilt: 28, 
        color: 0x3366FF, 
        texture: 'neptune.jpg',
        type: 'Muz giganti',
        diameter: '49 244 km',
        distance: 'Quyoshdan 4,5 milliard km',
        period: '165 Yer yili',
        rotation: '16 soat 6 daqiqa',
        moons: 14,
        atmosphere: '80% vodorod, 19% geliy va 1% metan',
        temperature: 'Taxminan −214°C',
        fact: 'Neptunda shamol tezligi soatiga 2 000 kilometrdan oshishi mumkin. U kuzatilishidan avval matematik hisob-kitoblar orqali mavjudligi bashorat qilingan.',
        audioDescription: 'Neptun — Quyoshdan eng uzoqda joylashgan sayyoralardan biri va muz giganti. Uning atmosferasida shamol tezligi soatiga 2 000 kilometrdan oshishi mumkin. Neptunning mavjudligi teleskopda kuzatilishidan oldin matematik hisob-kitoblar orqali bashorat qilingan.',
        labelColor: '#4682B4'
    },
    { 
        name: 'Pluto', 
        size: 1.8, 
        realSize: 2377,
        a: 750, 
        b: 745, 
        speed: 0.004, 
        tilt: 120, 
        color: 0xFFCC99, 
        texture: 'pluto.jpg',
        type: 'Mitti sayyora (Kuiper kamari jismi)',
        diameter: '2 377 km',
        distance: 'Quyoshdan 5,9 milliard km',
        period: '248 Yer yili',
        rotation: '6,4 Yer kuni',
        moons: 5,
        atmosphere: 'Quyoshga yaqinlashganda azot, metan va uglerod oksididan iborat siyrak atmosfera',
        temperature: '−233°C dan −223°C gacha',
        fact: 'Plutonda yurak shaklidagi muzlik tekisligi bor. Eng katta yo‘ldoshi Xaron bilan Pluton ikkalasining o‘rtasidagi umumiy nuqta atrofida aylanadi.',
        audioDescription: 'Pluton mitti sayyora sifatida tasniflanadi va Quyoshdan juda uzoqda joylashgan. Uning yuzasida yurak shaklini eslatuvchi ulkan muzli hudud bor. Eng katta yo‘ldoshi Xaron Plutonga nisbatan shunchalik yirikki, ular umumiy og‘irlik markazi atrofida aylanadi.',
        labelColor: '#CD853F'
    },
    { 
        name: 'Ceres', 
        size: 1, 
        realSize: 946,
        a: 400, 
        b: 395, 
        speed: 0.3, 
        tilt: 4, 
        color: 0xAAAAAA, 
        texture: 'ceres.jpg',
        type: 'Mitti sayyora (asteroidlar kamarida)',
        diameter: '946 km',
        distance: 'Quyoshdan 414 million km',
        period: '4,6 Yer yili',
        rotation: '9 soat 4 daqiqa',
        moons: 0,
        atmosphere: 'Juda siyrak suv bug‘i',
        temperature: 'Taxminan −105°C',
        fact: 'Serera asteroidlar kamaridagi eng katta jismdir. Uning muzli qatlami ostida suyuq suv bo‘lishi mumkin.',
        audioDescription: 'Serera asteroidlar kamaridagi eng katta jism va mitti sayyoradir. Olimlar uning muzli qatlami ostida sho‘r suyuq suv zaxiralari bo‘lishi mumkin deb hisoblaydi.',
        labelColor: '#D3D3D3'
    }
];

/* ============================================= */
/* SCENE INITIALIZATION */
/* ============================================= */

function init() {
    try {
        console.log("Initializing solar system...");
        
        // Count textures to load
        texturesToLoad = planetData.length; // Main textures
        planetData.forEach(data => {
            if (data.ring) texturesToLoad++; // Ring textures
        });
        texturesToLoad += 2; // Asteroid and Kuiper belt textures
        
        // Create scene with proper settings
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.0001);
        
        // Create renderer with optimal settings
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        document.body.appendChild(renderer.domElement);
        
        // Create camera with sensible defaults
        camera = new THREE.PerspectiveCamera(
            60, // FOV
            window.innerWidth / window.innerHeight,
            0.1, // Near plane
            100000 // Far plane
        );
        camera.position.set(0, 300, 1000);
        camera.layers.enableAll();
        
        // Set up orbit controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 100;
        controls.maxDistance = 5000;
        controls.maxPolarAngle = Math.PI * 0.9;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        
        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const sunLight = new THREE.PointLight(0xffffe0, 2, 10000);
        sunLight.castShadow = true;
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);
        
        // Create celestial objects
        createStarfield();
        createSolarSystem();
        
        // Event handlers
        setupEventHandlers();
        
        // Start animation loop
        animate();
        
        // Loading timeout fallback
        setTimeout(() => {
            if (!loadingComplete) {
                console.warn("Loading timeout - proceeding with available assets");
                document.getElementById('loading').style.display = 'none';
                loadingComplete = true;
            }
        }, 15000);
        
    } catch (error) {
        console.error("Initialization error:", error);
        document.getElementById('loading').innerHTML = 
            `<div>Quyosh tizimini yuklashda xatolik yuz berdi</div>
             <div style='margin-top:20px;color:#ff6666'>${error.message}</div>`;
    }
}

/* ============================================= */
/* SCENE ELEMENTS CREATION */
/* ============================================= */

function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        vertexColors: true
    });
    
    const starsVertices = [];
    const starsColors = [];
    const color = new THREE.Color();
    
    for (let i = 0; i < 20000; i++) {
        const radius = 10000 * Math.pow(Math.random(), 2);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        starsVertices.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        
        const hue = 0.1 + Math.random() * 0.1;
        const saturation = 0.1 + Math.random() * 0.3;
        const lightness = 0.5 + Math.random() * 0.5;
        color.setHSL(hue, saturation, lightness);
        starsColors.push(color.r, color.g, color.b);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createSolarSystem() {
    planetData.forEach(data => {
        if (data.name.includes('Sun')) {
            createSun(data);
        } else {
            createPlanet(data);
        }
    });
    
    createAsteroidBelt();
    createKuiperBelt();
}

function createSun(data) {
    const texturePath = TEXTURE_BASE_PATH + data.texture;
    console.log(`Loading Sun from: ${texturePath}`);

    const geometry = new THREE.SphereGeometry(data.size, 128, 128);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        emissive: 0xffaa33,
        emissiveIntensity: 0.8
    });
    const sun = new THREE.Mesh(geometry, material);
    sun.name = "SUN_CORE";
    sun.position.set(0, 0, 0);
    sun.renderOrder = 9999;
    sun.layers.enableAll();
    scene.add(sun);

    textureLoader.load(texturePath, 
        (texture) => {
            console.log("Sun texture loaded successfully");
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            sun.material.map = texture;
            sun.material.needsUpdate = true;
        },
        undefined,
        (err) => {
            console.error("Sun texture failed, using fallback:", err);
        }
    );

    const glowGeometry = new THREE.SphereGeometry(data.size * 1.4, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa33,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.name = "SUN_GLOW";
    sun.add(glow);

    const label = createTextLabel(getLocalizedPlanetName(data), 24, data.labelColor);
    label.position.set(0, data.size + 15, 0);
    sun.add(label);

    planets.push({
        data: data,
        mesh: sun,
        label: label,
        glow: glow
    });

    const sunLight = scene.children.find(c => c instanceof THREE.PointLight);
    if (sunLight) {
        sunLight.position.set(0, 0, 0);
        sunLight.intensity = 2;
    }

    updateLoadingProgress();
}

function createPlanet(data) {
    const texturePath = TEXTURE_BASE_PATH + data.texture;
    console.log(`Creating ${data.name} with texture: ${texturePath}`);

    // MOON HANDLING
    if (data.name.includes('Moon') || data.name.includes('Luna')) {
        console.log(`MOON CREATION STARTED for ${data.name}`);
        
        const parentPlanet = planets.find(p => p.data.name === data.parent);
        if (!parentPlanet) {
            console.error(`CRITICAL: Parent ${data.parent} not found for Moon!`);
            return;
        }

        const moonMaterial = new THREE.MeshStandardMaterial({
            color: 0xBBBBBB,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x555555,
            emissiveIntensity: 0.7
        });

        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(data.size, 64, 64),
            moonMaterial
        );
        moon.name = `MOON_${data.parent.replace(/\s+/g, '_')}`;
        moon.renderOrder = 999;
        moon.castShadow = true;

        moon.position.copy(parentPlanet.mesh.position);
        moon.position.x += data.a;

        textureLoader.load(texturePath, 
            (texture) => {
                console.log(`Moon texture loaded for ${data.name}`);
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                moon.material.map = texture;
                moon.material.needsUpdate = true;
            },
            undefined,
            (err) => {
                console.warn(`Moon texture failed, using fallback: ${err}`);
            }
        );

        const label = createTextLabel(getLocalizedPlanetName(data), 16, data.labelColor);
        label.name = `${data.name}_LABEL`;

        planets.push({
            data: data,
            mesh: moon,
            label: label,
            isMoon: true,
            parentObject: parentPlanet.mesh,
            orbitRadiusX: data.a,
            orbitRadiusZ: data.b,
            orbitSpeed: data.speed
        });

        scene.add(moon);
        scene.add(label);
        
        console.log(`Moon created successfully at:`, moon.position);
        updateLoadingProgress();
        return;
    }

    // NORMAL PLANET CREATION
    const geometry = new THREE.SphereGeometry(data.size, 128, 128);
    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.8,
        metalness: 0.2,
        emissive: 0x000000,
        emissiveIntensity: 0
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.name = data.name.replace(/\s+/g, '_');
    planet.castShadow = true;
    planet.receiveShadow = true;
    planet.rotation.z = data.tilt * Math.PI/180;

    textureLoader.load(texturePath, 
        (texture) => {
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            planet.material.map = texture;
            planet.material.needsUpdate = true;
        },
        undefined,
        (err) => {
            console.error(`Texture load failed for ${data.name}:`, err);
        }
    );

    const label = createTextLabel(getLocalizedPlanetName(data), 20, data.labelColor);
    
    // Create orbit path
    const curve = new THREE.EllipseCurve(0, 0, data.a, data.b, 0, 2*Math.PI, false);
    const points = curve.getPoints(256).map(pt => new THREE.Vector3(pt.x, 0, pt.y));
    const orbit = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points), 
        new THREE.LineBasicMaterial({ 
            color: 0x555555,
            transparent: true,
            opacity: 0.5
        })
    );

    // Initial position
    const angle = Math.random() * Math.PI * 2;
    planet.position.set(
        data.a * Math.cos(angle),
        0,
        data.b * Math.sin(angle)
    );

    scene.add(planet);
    scene.add(label);
    scene.add(orbit);

    const planetObj = {
        data: data,
        mesh: planet,
        label: label,
        orbit: orbit,
        currentAngle: angle
    };

    planets.push(planetObj);

    // Create rings if specified
    if (data.ring) {
        createPlanetRings(planetObj);
    }

    updateLoadingProgress();
}

function createPlanetRings(planetObj) {
    const data = planetObj.data;
    const ringTexturePath = TEXTURE_BASE_PATH + data.ringTexture;
    
    textureLoader.load(ringTexturePath, (texture) => {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        const ringGeometry = new THREE.RingGeometry(
            data.innerRingRadius, 
            data.outerRingRadius, 
            64
        );
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.rotation.z = data.ringTilt * Math.PI / 180;
        rings.renderOrder = 1;
        
        planetObj.mesh.add(rings);
        planetObj.rings = rings;
        
        console.log(`Created rings for ${data.name}`);
    }, undefined, (err) => {
        console.error(`Failed to load ring texture for ${data.name}:`, err);
    });
}

function createAsteroidBelt() {
    const beltGeometry = new THREE.BufferGeometry();
    const pts = [];
    const colors = [];
    const color = new THREE.Color();
    
    textureLoader.load(TEXTURE_BASE_PATH + 'asteroid.jpg', function(texture) {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        for(let i = 0; i < 10000; i++) {
            const r = 350 + Math.random() * 100;
            const ang = Math.random() * Math.PI * 2;
            const x = r * Math.cos(ang);
            const z = r * Math.sin(ang);
            const y = (Math.random() - 0.5) * 40;
            pts.push(x, y, z);
            
            const hue = 0.05 + Math.random() * 0.1;
            const saturation = 0.3 + Math.random() * 0.3;
            const lightness = 0.1 + Math.random() * 0.2;
            color.setHSL(hue, saturation, lightness);
            colors.push(color.r, color.g, color.b);
        }
        
        beltGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        beltGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        asteroidBelt = new THREE.Points(
            beltGeometry, 
            new THREE.PointsMaterial({ 
                size: 1.5,
                map: texture,
                vertexColors: true,
                transparent: true,
                opacity: 0.9
            })
        );
        scene.add(asteroidBelt);
        updateLoadingProgress();
    }, undefined, function(err) {
        console.error("Error loading asteroid texture:", err);
        // Fallback without texture
        for(let i = 0; i < 10000; i++) {
            const r = 350 + Math.random() * 100;
            const ang = Math.random() * Math.PI * 2;
            const x = r * Math.cos(ang);
            const z = r * Math.sin(ang);
            const y = (Math.random() - 0.5) * 40;
            pts.push(x, y, z);
            
            const hue = 0.05 + Math.random() * 0.1;
            const saturation = 0.3 + Math.random() * 0.3;
            const lightness = 0.1 + Math.random() * 0.2;
            color.setHSL(hue, saturation, lightness);
            colors.push(color.r, color.g, color.b);
        }
        
        beltGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        beltGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        asteroidBelt = new THREE.Points(
            beltGeometry, 
            new THREE.PointsMaterial({ 
                size: 1.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.9
            })
        );
        scene.add(asteroidBelt);
        updateLoadingProgress();
    });
}

function createKuiperBelt() {
    const beltGeometry = new THREE.BufferGeometry();
    const pts = [];
    const colors = [];
    const color = new THREE.Color();
    
    textureLoader.load(TEXTURE_BASE_PATH + 'kuiper.jpg', function(texture) {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        for(let i = 0; i < 5000; i++) {
            const r = 750 + Math.random() * 250;
            const ang = Math.random() * Math.PI * 2;
            const x = r * Math.cos(ang);
            const z = r * Math.sin(ang);
            const y = (Math.random() - 0.5) * 100;
            pts.push(x, y, z);
            
            const hue = 0.1 + Math.random() * 0.1;
            const saturation = 0.2 + Math.random() * 0.3;
            const lightness = 0.1 + Math.random() * 0.2;
            color.setHSL(hue, saturation, lightness);
            colors.push(color.r, color.g, color.b);
        }
        
        beltGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        beltGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        kuiperBelt = new THREE.Points(
            beltGeometry, 
            new THREE.PointsMaterial({ 
                size: 1.2,
                map: texture,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            })
        );
        scene.add(kuiperBelt);
        updateLoadingProgress();
    }, undefined, function(err) {
        console.error("Error loading kuiper belt texture:", err);
        // Fallback without texture
        for(let i = 0; i < 5000; i++) {
            const r = 750 + Math.random() * 250;
            const ang = Math.random() * Math.PI * 2;
            const x = r * Math.cos(ang);
            const z = r * Math.sin(ang);
            const y = (Math.random() - 0.5) * 100;
            pts.push(x, y, z);
            
            const hue = 0.1 + Math.random() * 0.1;
            const saturation = 0.2 + Math.random() * 0.3;
            const lightness = 0.1 + Math.random() * 0.2;
            color.setHSL(hue, saturation, lightness);
            colors.push(color.r, color.g, color.b);
        }
        
        beltGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        beltGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        kuiperBelt = new THREE.Points(
            beltGeometry, 
            new THREE.PointsMaterial({ 
                size: 1.2,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            })
        );
        scene.add(kuiperBelt);
        updateLoadingProgress();
    });
}

function createTextLabel(text, size, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const padding = 10;
    
    context.font = `Bold ${size}px Arial`;
    const textWidth = context.measureText(text).width;
    
    canvas.width = Math.min(512, textWidth + padding * 2);
    canvas.height = size + padding * 2;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.beginPath();
    context.roundRect(0, 0, canvas.width, canvas.height, 8);
    context.fill();
    
    context.strokeStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 10;
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(0, 0, canvas.width, canvas.height, 8);
    context.stroke();
    context.shadowBlur = 0;
    
    context.font = `Bold ${size}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / 10, canvas.height / 10, 1);
    return sprite;
}

/* ============================================= */
/* VOICE CONTROL FUNCTIONS */
/* ============================================= */

function speakText(text, onComplete) {
    if (isPaused) {
        if (onComplete) onComplete();
        return;
    }

    stopSpeech();

    const requestId = activeSpeechRequestId;
    const controller = new AbortController();
    activeSpeechRequest = controller;
    setSpeechStatus('Yandex Alena ovozi tayyorlanmoqda...');

    const speechUrl = new URL('/api/speech', window.location.href);
    speechUrl.searchParams.set('text', text);
    fetch(speechUrl, {
        signal: controller.signal
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ovoz xizmati ${response.status} xato kodi bilan javob berdi.`);
            }
            return response.blob();
        })
        .then(blob => {
            if (requestId !== activeSpeechRequestId) return;

            activeSpeechObjectUrl = URL.createObjectURL(blob);
            activeSpeechAudio = new Audio(activeSpeechObjectUrl);
            activeSpeechAudio.onended = () => finishSpeech(requestId, onComplete);
            activeSpeechAudio.onerror = () => {
                if (requestId !== activeSpeechRequestId) return;
                finishSpeech(requestId, onComplete, 'Ovoz faylini ijro qilib bo‘lmadi. Qayta urinib ko‘ring.');
            };
            setSpeechStatus('Yandex Alena ovozi bilan o‘qilmoqda...');
            return activeSpeechAudio.play();
        })
        .catch(error => {
            if (requestId !== activeSpeechRequestId || error.name === 'AbortError') return;
            console.error('Yandex Alena ovoz sintezi amalga oshmadi:', error);
            console.error('Yandex Alena ovoz sintezi amalga oshmadi:', error);
            finishSpeech(requestId, onComplete, 'Yandex ovozi ishlamadi. Server kaliti va internet ulanishini tekshiring.');
        });
}

function finishSpeech(requestId, onComplete, status = 'O‘qish tugadi.') {
    if (requestId !== activeSpeechRequestId) return;

    activeSpeechAudio = null;
    activeSpeechRequest = null;
    if (activeSpeechObjectUrl) {
        URL.revokeObjectURL(activeSpeechObjectUrl);
        activeSpeechObjectUrl = null;
    }
    setSpeechStatus(status);
    if (onComplete) onComplete();
}

function setSpeechStatus(message) {
    const status = document.getElementById('voice-status');
    if (status) status.textContent = message;
}

function stopSpeech() {
    activeSpeechRequestId++;
    if (activeSpeechRequest) {
        activeSpeechRequest.abort();
        activeSpeechRequest = null;
    }
    if (activeSpeechAudio) {
        activeSpeechAudio.pause();
        activeSpeechAudio.src = '';
        activeSpeechAudio = null;
    }
    if (activeSpeechObjectUrl) {
        URL.revokeObjectURL(activeSpeechObjectUrl);
        activeSpeechObjectUrl = null;
    }
}

function pauseSpeech() {
    if (activeSpeechAudio) {
        activeSpeechAudio.pause();
    }
}

function resumeSpeech() {
    if (activeSpeechAudio) {
        activeSpeechAudio.play().catch(error => {
            console.error('Ovozni davom ettirib bo‘lmadi:', error);
            setSpeechStatus('Ovozni davom ettirib bo‘lmadi.');
        });
    }
}

/* ============================================= */
/* EVENT HANDLERS AND UI CONTROLS */
/* ============================================= */

function setupEventHandlers() {
    window.addEventListener('resize', onWindowResize);
    setupPlanetClickDetection();
    setupUIControls();
    setupTourControls();
    setupVR();
    setupFullscreen();
    setupVoiceControls();
    setupPauseButton();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupPlanetClickDetection() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onPlanetClick(event) {
        if (!loadingComplete) return;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
            planets.map(p => p.mesh),
            true
        );
        
        if (intersects.length > 0) {
            let planetMesh = intersects[0].object;
            while (planetMesh.parent && planetMesh.parent !== scene) {
                planetMesh = planetMesh.parent;
            }
            
            const planet = planets.find(p => p.mesh === planetMesh);
            if (planet) {
                selectPlanet(planet);
                
                const now = Date.now();
                if (now - lastClickTime < 300) {
                    flyToPlanet(planets.indexOf(planet));
                }
                lastClickTime = now;
            }
        }
    }
    
    window.addEventListener('click', onPlanetClick);
}

function selectPlanet(planet) {
    selectedPlanet = planet;
    showPlanetInfo(planet.data);
    highlightPlanet(planet);
    
    stopSpeech();
    speakText(planet.data.audioDescription);
}

function highlightPlanet(planet) {
    // Reset all highlights
    planets.forEach(p => {
        if (p.mesh.material.emissive) {
            p.mesh.material.emissive.setHex(0x000000);
            p.mesh.material.emissiveIntensity = 0;
        }
    });
    
    // Highlight selected planet
    if (planet.mesh.material.emissive) {
        planet.mesh.material.emissive.setHex(0x333333);
        planet.mesh.material.emissiveIntensity = 0.5;
    }
    
    // Pulse animation
    const originalScale = planet.mesh.scale.clone();
    planet.mesh.scale.multiplyScalar(1.1);
    setTimeout(() => planet.mesh.scale.copy(originalScale), 500);
}

function setupUIControls() {
    document.getElementById('speed').addEventListener('input', function() {
        const speedValue = parseFloat(this.value);
        document.getElementById('speed-value').textContent = speedValue.toFixed(1) + 'x';
    });
    
    const toggleControls = {
        'show-orbits': (visible) => planets.forEach(p => p.orbit && (p.orbit.visible = visible)),
        'show-labels': (visible) => planets.forEach(p => p.label && (p.label.visible = visible)),
        'show-asteroids': (visible) => {
            if (asteroidBelt) asteroidBelt.visible = visible;
            if (kuiperBelt) kuiperBelt.visible = visible;
        },
        'show-scale': (visible) => {
            document.getElementById('scale-indicator').style.display = visible ? 'block' : 'none';
        },
        'auto-rotate': (enabled) => {
            autoRotate = enabled;
            if (!isTourActive && !vrEnabled) {
                controls.autoRotate = autoRotate;
                controls.autoRotateSpeed = 0.5;
            }
        }
    };
    
    Object.entries(toggleControls).forEach(([id, callback]) => {
        document.getElementById(id).addEventListener('change', (e) => callback(e.target.checked));
    });
}

function setupPauseButton() {
    document.getElementById('pause-button').addEventListener('click', function() {
        isPaused = !isPaused;
        this.textContent = isPaused ? 'Davom ettirish' : 'Pauza';
        
        if (isPaused) {
            pauseSpeech();
        } else {
            resumeSpeech();
        }
    });
}

function setupTourControls() {
    document.getElementById('tour-btn').addEventListener('click', function() {
        isTourActive = !isTourActive;
        this.textContent = isTourActive ? 'Sayohatni to‘xtatish' : 'Sayohatni boshlash';
        
        if (isTourActive) {
            stopSpeech();
            currentTourIndex = 0;
            flyToPlanetInSequence(currentTourIndex);
        } else {
            if (tourTimeout) {
                clearTimeout(tourTimeout);
                tourTimeout = null;
            }
            
            if (selectedPlanet) {
                selectedPlanet.mesh.material.emissive.setHex(0x000000);
                selectedPlanet.mesh.material.emissiveIntensity = 0;
            }
        }
    });
    
    document.getElementById('next-planet').addEventListener('click', function() {
        if (isTourActive) {
            stopSpeech();
            if (tourTimeout) {
                clearTimeout(tourTimeout);
                tourTimeout = null;
            }
        }
        
        currentTourIndex = (currentTourIndex + 1) % tourSequence.length;
        flyToPlanetInSequence(currentTourIndex);
    });
    
    document.getElementById('prev-planet').addEventListener('click', function() {
        if (isTourActive) {
            stopSpeech();
            if (tourTimeout) {
                clearTimeout(tourTimeout);
                tourTimeout = null;
            }
        }
        
        currentTourIndex = (currentTourIndex - 1 + tourSequence.length) % tourSequence.length;
        flyToPlanetInSequence(currentTourIndex);
    });
}

function flyToPlanetInSequence(index) {
    if (index < 0 || index >= tourSequence.length) return;
    
    if (tourTimeout) {
        clearTimeout(tourTimeout);
        tourTimeout = null;
    }

    stopSpeech();

    const planetName = tourSequence[index];
    const planetIndex = planets.findIndex(p => p.data.name === planetName);
    
    if (planetIndex === -1) return;
    
    const planet = planets[planetIndex];
    const targetPosition = planet.mesh.position.clone()
        .normalize()
        .multiplyScalar(Math.max(planet.data.size * 10, 300));
    targetPosition.y += planet.data.size * 3;
    
    const lookAtPosition = planet.mesh.position.clone();
    lookAtPosition.y += planet.data.size * 0.5;
    
    new TWEEN.Tween(camera.position)
        .to(targetPosition, 2500)
        .easing(TWEEN.Easing.Quintic.InOut)
        .start();
    
    new TWEEN.Tween(controls.target)
        .to(lookAtPosition, 2500)
        .easing(TWEEN.Easing.Quintic.InOut)
        .onStart(() => {
            highlightPlanet(planet);
        })
        .onComplete(() => {
            selectPlanet(planet);
            
            const wordCount = planet.data.audioDescription.split(/\s+/).length;
            const estimatedDuration = Math.max(3000, (wordCount / 150) * 60 * 1000);
            
            speakText(planet.data.audioDescription, () => {
                if (isTourActive) {
                    tourTimeout = setTimeout(() => {
                        currentTourIndex = (index + 1) % tourSequence.length;
                        flyToPlanetInSequence(currentTourIndex);
                    }, 1000);
                }
            });
        })
        .start();
}

function flyToPlanet(index) {
    if (index < 0 || index >= planets.length) return;
    
    const planet = planets[index];
    const targetPosition = planet.mesh.position.clone()
        .normalize()
        .multiplyScalar(Math.max(planet.data.size * 10, 300));
    targetPosition.y += planet.data.size * 3;
    
    const lookAtPosition = planet.mesh.position.clone();
    lookAtPosition.y += planet.data.size * 0.5;
    
    new TWEEN.Tween(camera.position)
        .to(targetPosition, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    
    new TWEEN.Tween(controls.target)
        .to(lookAtPosition, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
            selectPlanet(planet);
        })
        .start();
}

function setupVR() {
    if (!('xr' in navigator)) {
        document.getElementById('vr-button').style.display = 'none';
        return;
    }
    
    navigator.xr.isSessionSupported('immersive-vr').then(supported => {
        if (!supported) {
            document.getElementById('vr-button').style.display = 'none';
            return;
        }
        
        document.getElementById('vr-button').addEventListener('click', toggleVR);
    });
}

function toggleVR() {
    if (vrEnabled) {
        renderer.xr.getSession()?.end();
        vrEnabled = false;
        document.getElementById('vr-button').textContent = 'VR rejimi';
    } else {
        renderer.xr.enabled = true;
        navigator.xr.requestSession('immersive-vr')
            .then(session => {
                renderer.xr.setSession(session);
                vrEnabled = true;
                document.getElementById('vr-button').textContent = 'VR rejimidan chiqish';
                renderer.setAnimationLoop(() => renderer.render(scene, camera));
                session.addEventListener('end', () => {
                    vrEnabled = false;
                    document.getElementById('vr-button').textContent = 'VR rejimi';
                    renderer.setAnimationLoop(null);
                });
            });
    }
}

function setupFullscreen() {
    document.getElementById('fullscreen-button').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => {
                    document.getElementById('fullscreen-button').textContent = 'To‘liq ekrandan chiqish';
                });
        } else {
            document.exitFullscreen();
        }
    });
    
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            document.getElementById('fullscreen-button').textContent = 'To‘liq ekran';
        }
    });
}

function setupVoiceControls() {
    document.getElementById('read-aloud').addEventListener('click', readAloud);
    document.getElementById('voice-stop').addEventListener('click', stopSpeech);
    document.getElementById('voice-pause').addEventListener('click', pauseSpeech);
    document.getElementById('voice-play').addEventListener('click', resumeSpeech);
}

function readAloud() {
    const infoTitle = document.getElementById('info-title').textContent;
    const facts = Array.from(document.querySelectorAll('.planet-fact'))
        .map(el => el.textContent)
        .join('. ');
    stopSpeech();
    speakText(`${infoTitle}. ${facts}`);
}

/* ============================================= */
/* INFO PANEL AND UTILITIES */
/* ============================================= */

function showPlanetInfo(planetData) {
    Object.entries({
        'info-title': getLocalizedPlanetName(planetData),
        'info-type': planetData.type,
        'info-diameter': planetData.diameter,
        'info-distance': planetData.distance,
        'info-period': planetData.period,
        'info-rotation': planetData.rotation,
        'info-moons': planetData.moons,
        'info-atmosphere': planetData.atmosphere,
        'info-temperature': planetData.temperature,
        'info-fact': planetData.fact
    }).forEach(([id, value]) => {
        document.getElementById(id).textContent = value;
    });
    
    const panel = document.getElementById('info-panel');
    panel.style.display = 'block';
    panel.style.borderColor = planetData.labelColor;
    panel.style.boxShadow = `0 0 15px ${planetData.labelColor}`;
    
    setTimeout(() => {
        if (!panel.matches(':hover')) {
            panel.style.display = 'none';
        }
    }, 15000);
}

function updateLoadingProgress() {
    loadedTextures++;
    const progress = Math.round((loadedTextures / texturesToLoad) * 100);
    document.getElementById('loading-progress').value = progress;
    document.getElementById('loading-texture').textContent = `Teksturalar yuklanmoqda (${loadedTextures}/${texturesToLoad})...`;
    
    if (loadedTextures === texturesToLoad) {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            loadingComplete = true;
            
            new TWEEN.Tween(camera.position)
                .to({ x: 0, y: 300, z: 800 }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }, 500);
    }
}

/* ============================================= */
/* ANIMATION LOOP */
/* ============================================= */

function animate() {
    requestAnimationFrame(animate);
    
    if (isPaused) return;
    
    const t = Date.now() * 0.00005 * parseFloat(document.getElementById('speed').value);
    
    TWEEN.update();
    
    controls.autoRotate = autoRotate && !isTourActive && !vrEnabled;
    
    planets.forEach(planet => {
        if (planet.isMoon) {
            const time = Date.now() * 0.001 * planet.orbitSpeed;
            
            planet.mesh.position.set(
                planet.parentObject.position.x + planet.orbitRadiusX * Math.cos(time),
                planet.parentObject.position.y,
                planet.parentObject.position.z + planet.orbitRadiusZ * Math.sin(time)
            );
            
            planet.mesh.rotation.y += 0.002;
            
            if (planet.label) {
                planet.label.position.copy(planet.mesh.position);
                planet.label.position.y += planet.data.size + 8;
                planet.label.lookAt(camera.position);
                
                const dist = camera.position.distanceTo(planet.mesh.position);
                const scale = Math.min(1, 500/dist);
                planet.label.scale.set(scale * 20, scale * 10, 1);
            }
            return;
        }

        planet.mesh.rotation.y += 0.005;
        
        if (!planet.data.name.includes('Sun')) {
            const phi = t * planet.data.speed;
            planet.mesh.position.set(
                planet.data.a * Math.cos(phi),
                0,
                planet.data.b * Math.sin(phi)
            );
        }
        
        if (planet.label) {
            planet.label.position.copy(planet.mesh.position);
            planet.label.position.y += planet.data.size + 10;
            planet.label.lookAt(camera.position);
            
            const dist = camera.position.distanceTo(planet.mesh.position);
            const scale = Math.min(1, 1000/dist);
            planet.label.scale.set(scale * 25, scale * 12, 1);
        }
    });
    
    if (!vrEnabled) {
        controls.update();
        renderer.render(scene, camera);
    }
}

function updateLabelSizes() {
    planets.forEach(planet => {
        if (planet.label) {
            const distance = planet.mesh.position.distanceTo(camera.position);
            const scaleFactor = Math.min(1, 1000 / distance);
            planet.label.scale.set(scaleFactor * 25.6, scaleFactor * 12.8, 1);
            
            const labelHeight = planet.data.size + (planet.label.scale.y * 5);
            planet.label.position.y = labelHeight;
            
            const visibility = Math.min(1, 100 / distance);
            planet.label.material.opacity = visibility;
        }
    });
}

function updateScaleIndicator() {
    const sun = planets.find(p => p.data.name.includes('Sun'));
    if (!sun) return;
    
    const distance = camera.position.distanceTo(sun.mesh.position);
    const scale = Math.round(distance / 10) * 1000;
    document.getElementById('scale-value').textContent = scale.toLocaleString();
    
    const scaleIndicator = document.getElementById('scale-indicator');
    scaleIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    scaleIndicator.style.border = '1px solid #1E90FF';
    scaleIndicator.style.borderRadius = '5px';
    scaleIndicator.style.padding = '5px';
    scaleIndicator.style.color = '#1E90FF';
}

/* ============================================= */
/* INITIALIZATION */
/* ============================================= */

window.addEventListener('load', init);