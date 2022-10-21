let result = [];
let firstName = ['Ariel', 'Ega', 'Deska', 'Vanka', 'Bagas', 'Bayu', 'Rizky'];
let lastName = ['Izzati' ,'Arisandi' , 'Ridha' ,'Ramadhan' , 'Binar', 'Fani'];
let age = [18, 19, 20, 21, 22, 23, 24];
let gender = ['male','female'];
let region = ['ID', 'SG', 'EN', 'USA', 'RU'];
let active = [true, false];
let browser = ['Firefox', 'Chrome', 'IE', 'Opera', 'Safari'];
let religion = ['Islam', 'Kristen', 'Konghucu'];
let job = ['QA', 'BE', 'FE', 'HR'];
//let getGender, getRegion, getActive, getBrowser, getReligion = 0;

for(let i = 0; i < 20; i ++){
    let getGender = Math.floor(Math.random() * gender.length);
    let getRegion = Math.floor(Math.random() * region.length);
    let getActive = Math.floor(Math.random() * active.length);
    let getBrowser = Math.floor(Math.random() * browser.length);
    let getReligion = Math.floor(Math.random() * religion.length);
    let getAge = Math.floor(Math.random() * age.length);
    let getJob = Math.floor(Math.random() * job.length);
    let getFname = Math.floor(Math.random() * firstName.length);
    let getLname = Math.floor(Math.random() * lastName.length);
    let fullname = `${firstName[getFname]} ${lastName[getLname]}`;
    // console.log(fullname)

    result.push([{
        //name: "user " + i,
        name: fullname, 
        age: age[getAge],
        gender: gender[getGender],
        region: region[getRegion],
        active: active[getActive],
        browser: browser[getBrowser],
        religion: religion[getReligion],
        valid: 'Valid User',
        job: job[getJob],

    }])
}

console.log([...result])