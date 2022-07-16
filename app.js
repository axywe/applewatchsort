const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
const sizeOf = require('image-size');

let origin = fs.readdirSync("dir", (err, files) => {
    if(err) return console.log(err);
    return files;
});

let files = origin;

for(let i = 0;i<origin.length;i++){
     fs.lstat("./dir/" + origin[i], (err, stats) => {
        if(err) return console.log(err);
        if(stats.isDirectory()) {
            if (!fs.existsSync("./res/" + origin[i])){
                fs.mkdirSync("./res/" + origin[i]);
            }//else console.log("Папка существует");
            fs.readdir("./dir/" + origin[i], (err, locfiles) => {
                if(err) return console.log(err);
                const width = 600
                const height = 600

                const canvas = createCanvas(width, height)
                const context = canvas.getContext('2d')

                context.fillStyle = '#000'
                context.fillRect(0, 0, width, height)

                context.font = 'bold 70pt Menlo'
                context.textAlign = 'center'
                context.textBaseline = 'top'

                const text = `${i}`;

                const textWidth = context.measureText(text).width
                context.fillStyle = '#fff'
                context.fillText(text, 300-10, 300-textWidth)

                const buffer = canvas.toBuffer('image/jpeg');
                fs.writeFileSync("./dir/"+origin[i]+"/0C.jpg", buffer);
                locfiles.sort(function (a, b) {  return a.split('.')[0] - b.split('.')[0];}); //fix nada
                for(let j = 0; j<locfiles.length;j++){
                    files.push(`${origin[i]}/${locfiles[j]}`);
                }
            });
        }
    });
    files.sort( (a, b) => {
        return a.split('/')[0] - b.split('/')[0];
    });
}

//Создание нового файла и запись в него
let creation = (i) => {
    let source = "./dir/" + files[i];
    let result = "./res/" + files[i];
    if(files[i] === undefined){
        clearInterval(create);
        return console.log("В папке нет файлов");
    }
    if(source.includes(".DS_Store") || files[i].includes("photo")) return 1;
    console.log(source);
    sizeOf(source, function (err, dimensions) {
        if(err){
            if(err.code === "EISDIR") return 1;
            throw err;
        }
        loadImage(source).then(image => {
            const canvas = createCanvas(dimensions.width, dimensions.height);
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
            const buffer = canvas.toBuffer('image/jpeg');
            fs.writeFileSync(result, buffer);
            fs.stat(result, function(err, stats){
                console.log(source, stats.birthtime);
            });
        })
    })
    if(i === files.length - 1){
        clearInterval(create);
        console.log(files); //Тут завершение
        setTimeout(() => {
            console.log(`Проверка файлов:`)
            listObjects(readFrom);
            }, 5000);
    }
    return 0;
}
let i = 0;
let create = setInterval(() => {
    files.sort(function (a, b) {return a - b;});
    creation(i);
    // console.log(files)
    i++;
}, 1000);


let readFrom = './dir/';
//Проверка наличия файла
function listObjects(path){
    fs.readdir(path, (err, files) => {
        if(err) throw err;
        console.log(path)
        for (let file of files){
            fs.stat(`${path}/${file}`, (errStat, status) => { //Вместо файла тут был file.txt
                if(errStat) throw errStat
                if(status.isDirectory()){
                    console.log('Папка: ' + file);
                    fs.readdir(`./res/${file}`, (err) => {
                        if(err) throw err;
                        else console.log(`./res/${file}`)
                    })
                    listObjects(path + file); // продолжаем рекурсию
                }else{
                    console.log('Файл: ' + file);
                    console.log(`Orig: ${path}/${file}`)
                    if(file.includes(".DS_Store") || file.includes("photo_2022")){
                    }else{
                        fs.readFile(`./res${path.slice(5,100)}/${file}`, (err) => {
                            if(err) throw err;
                            else console.log(`./res${path.slice(5,100)}/${file}`)
                        })
                    }
                }
            });
        }
    });
}