const section_container = document.getElementById('sections');
const num_sections = section_container.childElementCount;
const rotation_angle = 2 * Math.PI / num_sections;

let current_section = 0;
let loading = false;

document.body.addEventListener('wheel', (e) => {
    if (!loading) {
        loading = true;

        if (e.deltaY < 0) {
            current_section--;
        } else if (e.deltaY > 0) {
            current_section++;
        }
    
        section_container.style.transform = `rotate(${rotation_angle * current_section}rad)`;

        setTimeout(() => {loading = false}, 1000);
    }
})