const images = {
    place2022: place2022,
    place2023: place2022,
};

let selectedImage = images[2];
const imageSelectEvent = new Event('imageSelected', {detail: {imageName: selectedImage}});