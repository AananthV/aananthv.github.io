const section_container = document.getElementById('sections');

let rotation = 0;
document.body.addEventListener('wheel', (e) => {
    rotation += e.deltaY * 0.1;
    section_container.style.transform = `rotate(${rotation}deg)`
})