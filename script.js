(function() {
    // Configuración básica de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Configurar el fondo con un color sólido oscuro
    scene.background = new THREE.Color(0x121212); // Fondo oscuro

    // Agregar una luz ambiental
    const ambientLight = new THREE.AmbientLight(0x555555); // Luz ambiental suave
    scene.add(ambientLight);

    // Agregar una luz direccional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Función para crear un cubo con líneas (sin relleno)
    function createCube(color) {
        const geometry = new THREE.BoxGeometry();
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 }); // Línea más gruesa para mejor visibilidad
        const cube = new THREE.LineSegments(edges, material);
        cube.originalColor = color; // Guardar el color original para la animación
        cube.rotationSpeed = new THREE.Vector2(
            Math.random() * 0.02 - 0.01,
            Math.random() * 0.02 - 0.01
        ); // Velocidad de rotación aleatoria
        cube.hue = Math.random(); // Color inicial aleatorio
        cube.interactDistance = 2; // Distancia en la que el cubo reacciona al mouse
        return cube;
    }

    // Crear el cubo principal
    const originalCubeColor = new THREE.Color(0x00ff00); // Color verde brillante para destacar en el fondo oscuro
    const originalCube = createCube(originalCubeColor);
    scene.add(originalCube);

    // Posicionar la cámara
    camera.position.z = 5;

    // Variables para la transición de color
    let hue = 0;
    const hueSpeed = 0.001; // Velocidad del cambio de color

    // Variables para la rotación del mouse
    let mouseX = 0;
    let mouseY = 0;

    // Interpolación de rotación
    const rotationSpeed = 0.05; // Velocidad de interpolación de rotación

    // Animación
    function animate() {
        requestAnimationFrame(animate);

        // Actualizar el color de todos los cubos
        scene.traverse(object => {
            if (object instanceof THREE.LineSegments) {
                // Actualizar color
                object.hue += hueSpeed; // Incrementar el valor del matiz
                if (object.hue > 1) object.hue = 0; // Reiniciar el matiz si supera 1
                const color = new THREE.Color().setHSL(object.hue, 1, 0.5);
                object.material.color.set(color);

                // Convertir las coordenadas del mouse a coordenadas del mundo
                const mouseVector = new THREE.Vector3(mouseX, mouseY, 1).unproject(camera);
                const mousePosition = camera.position.clone().add(mouseVector.sub(camera.position).normalize().multiplyScalar(-camera.position.z / mouseVector.z));

                // Calcular la distancia entre el mouse y el cubo
                const distance = object.position.distanceTo(mousePosition);

                // Aplicar la rotación solo si el cubo está cerca del mouse
                if (distance < object.interactDistance) {
                    object.rotation.x += (mouseY - object.rotation.x) * rotationSpeed;
                    object.rotation.y += (mouseX - object.rotation.y) * rotationSpeed;
                } else {
                    // Aplicar una rotación aleatoria si está lejos
                    object.rotation.x += object.rotationSpeed.x;
                    object.rotation.y += object.rotationSpeed.y;
                }
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    // Ajustar el tamaño del canvas al redimensionar la ventana
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Controlar la posición del mouse
    window.addEventListener('mousemove', (event) => {
        // Obtener las coordenadas del mouse normalizadas
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Crear nuevos cubos al hacer clic
    window.addEventListener('click', (event) => {
        // Convertir la posición del clic a coordenadas de la escena
        const rect = renderer.domElement.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width * 2 - 1;
        const y = -(event.clientY - rect.top) / rect.height * 2 + 1;
        const mouseVector = new THREE.Vector3(x, y, 1).unproject(camera);

        // Calcular la posición en el espacio 3D
        const dir = mouseVector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const position = camera.position.clone().add(dir.multiplyScalar(distance));

        // Crear un nuevo cubo con las mismas características
        const newCube = createCube(originalCube.material.color.clone());
        newCube.position.copy(position);
        scene.add(newCube);
    });
})();
