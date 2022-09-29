function displayInput() {
            
    // name
    var firstName = document.getElementById("firstName").value;          
    var lastName = document.getElementById("lastName").value;
    var fullName = firstName + " " + lastName;

    // gender
    var gender = document.getElementById("gender").value;

    // email
    var email = document.getElementById("email").value;

    // age
    var age = document.getElementById("age").value;

    // url
    var url = document.getElementById("url").value;

    // comment
    var comment = document.getElementById("comment").value;

    // img
    var img = 'C:/Users/Lenovo G40/Documents/Bootcamp/bagas_zettacamp_catfish/assets/img/' + document.getElementById("img_upload").value.substring(12);


    // display
    document.getElementById("fullName_").innerHTML = fullName;
    document.getElementById("gender_").innerHTML = gender;  
    document.getElementById("email_").innerHTML = email; 
    document.getElementById("age_").innerHTML = age; 
    document.getElementById("url_").innerHTML = url;
    document.getElementById("comment_").innerHTML = comment; 
    document.getElementById("img_").src = img; 
}