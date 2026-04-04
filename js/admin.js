const menuItems = document.querySelectorAll(".sidebar ul li");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {
    item.addEventListener("click", () => {

        if(item.id === "logout"){
            alert("Sesión cerrada");
            window.location.href = "index.html";
            return;
        }

        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const sectionId = item.getAttribute("data-section");

        sections.forEach(section => {
            section.classList.remove("active");
            if(section.id === sectionId){
                section.classList.add("active");
            }
        });
    });
});
