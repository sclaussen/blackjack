function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

for (let i = 0; i < 10; i++) {
    console.log(getRandomInt(3));
}
