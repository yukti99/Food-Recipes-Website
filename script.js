
// getting html document elements 
const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");
const searchText = document.getElementById("search-text-id");
const searchBtn = document.getElementById("search");



//getRandomMeal();
displayMultipleRandomMeals();
fetchFavMeals();

function displayMultipleRandomMeals(){
    for(let i=0;i<10;i++){
        getRandomMeal();
    }
}

async function getRandomMeal(){
    const responseMeal = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const responseData = await responseMeal.json();
    const randomMeal = responseData.meals[0];
    //console.log(randomMeal);
    //alert(randomMeal);
    displayMeal(randomMeal,true);
}

async function getMealById(id){
    const respmeal = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    const respData = await respmeal.json();
    const meal = respData.meals[0];
    return meal;

}
async function getMealsBySearch(name){
    const meals = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+name);
    const respData = await meals.json();
    const m = respData.meals;
    return m;

}
// second parameter to tell if its a random meal or normal meal
function displayMeal(mealData,random=false){

    /*Javascript code to make html elements on the webpage */
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML=`
        <div class="meal" id="meal-id">
            <div class="meal-header">
                ${random ? `
                <span class="random">Top Recipe</span>` :''}
                <img 
                    src="${mealData.strMealThumb}"
                    alt="${mealData.strMeal}"
                />

            </div>
            <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                <button class="fav-btn">
                    <i class="fas fa-heart" aria-hidden="true"></i>
                </button>
            </div>
                    
        </div>
    `;

    const heartBtn = meal.querySelector(".meal-body .fav-btn");
    heartBtn.addEventListener('click',()=>{
        //alert("hello"); to check if on click working on heart button
       // heartBtn.classList.toggle("active");

       // whenever user clicks the heart button the meal is added to the local storage as the user's favourite meals
        if (heartBtn.classList.contains("active")){
            removeMealsLocalStorage(mealData.idMeal);
            heartBtn.classList.remove("active");
        }else{
            addMealsLocalStorage(mealData.idMeal);
            heartBtn.classList.add("active");
        }
        //function to get all the favourite meals once you like a meal 
        // clean to avoid duplicate favourites displaying
        favoriteContainer.innerHTML="";
        fetchFavMeals();

    });
    // to display the information of the food item as soon as user clicks on it
    meal.addEventListener("click",()=>{
       showMealInfo(mealData);

    });

    mealsEl.appendChild(meal);

}
function addMealsLocalStorage(mealId){
    const mealIds = getMealsLocalStorage();
    console.log(mealIds);
    localStorage.setItem('mealIds',JSON.stringify([...mealIds,mealId]) );

}

function removeMealsLocalStorage(mealId){
    const mealIds = getMealsLocalStorage();
    localStorage.setItem('mealIds',JSON.stringify(mealIds.filter((id) => id !== mealId)) );

}

function getMealsLocalStorage(){
    // to get meal ids from the local storage 
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds == null ? [] : mealIds;
}

/*await can be used for async functions only, it returns a promise rather than a value */
async function fetchFavMeals(){

    // clean the container
    favoriteContainer.innerHTML = "";
    
    // get the list of all meals' ids
    const mealIds = getMealsLocalStorage();

    for(let i=0;i<mealIds.length;i++){
        // for each of these meals stored in local storage by user 
        // when he clicked heart to make them favourite will be fetched one by one
        const Id = mealIds[i];
        meal = await getMealById(Id);
     
        addMealToFav(meal);
    }
    //console.log(meals);
   

}
function addMealToFav(mealData){

    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
        
    `;
    const closebtn = favMeal.querySelector(".clear");
    // to remove a favourite meal from the list
    closebtn.addEventListener("click",()=>{
        removeMealsLocalStorage(mealData.idMeal);
        fetchFavMeals();
        /*the heart should be turned off as this meal is not favourite anymore */
        var mealele = document.getElementById("meal-id");
        var hbtn = mealele.querySelector(".meal-body .fav-btn");
        hbtn.classList.remove("active");
    });
    // to display meal info whenever a favourite meal is clicked
    favMeal.addEventListener("click",()=>{
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);


}

function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update the Meal info
    const mealEl = document.createElement("div");

    const ingredients = [];

    // get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${
                    mealData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
            width="100%" 
            height="100%"
        />
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
        <h3>Instructions:</h3>
        <p>
        ${mealData.strInstructions}
        </p>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove("hidden");
}
searchBtn.addEventListener("click", async()=>{
    // clean the container
    mealsEl.innerHTML = "";
    const search = searchText.value;
    const meals  = await getMealsBySearch(search);
    // display all the meals that match the user's search input 
    if (meals){
        meals.forEach((meal) => {
            displayMeal(meal);
        });
    }
});
         

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});


