let WEATHER_API_KEY = '2276fd31f84ab4e336dd35dc2ebebbcc';

function findMode(array) {
    if (array.length === 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

const cityInput = document.getElementById('city-input');
cityInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchCity().then(r => console.log(r));
    }
});

async function searchCity() {
    let longitude;
    let latitude;
    let timezone;
    let country;

    const cityInput = document.getElementById("city-input").value;
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=metric&appid=${WEATHER_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById(`con_wea`).innerHTML = `${data.name}, ${data.sys.country}<img src=\"https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" width=\\"125px\\" height=\\"125px\\" alt="weather logo"> <br>
                ${data.weather[0].description}<br>
                Temp: ${data.main.temp}°C<br>
                H: ${data.main.temp_max}°C, L: ${data.main.temp_min}°C<br>
                Humidity: ${data.main.humidity}%<br>`
            longitude = data.coord.lon;
            latitude = data.coord.lat;
            timezone = data.timezone;
            country = data.sys.country;
        })
        .catch(error => {
            console.error("Error fetching city information:", error);
        });

    await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.list.length; i++) {
                data.list[i].time_z = new Date((data.list[i].dt) * 1000);
                data.list[i].dayOfMonth = data.list[i].time_z.getDate();
            }

            let firstDay = data.list[0].dayOfMonth;
            var daysInfoArray = [];
            var dayInfoArray = [];
            var dayArray = [firstDay];
            for (let i = 0; i < data.list.length; i++) {
                if (data.list[i].dayOfMonth === firstDay) {
                    dayInfoArray.push(data.list[i]);
                } else {
                    firstDay++;
                    daysInfoArray.push(dayInfoArray);
                    dayInfoArray = [data.list[i]];
                    dayArray.push(data.list[i].dayOfMonth);
                }
            }
            dayArray.pop();

            //the next 8 three hours forecast
            for (let i = 0; i < 8; i++) {
                data.list[i].main.temp = Math.round(data.list[i].main.temp * 100) / 100;
                data.list[i].main.humidity = Math.round(data.list[i].main.humidity * 100) / 100;
                document.getElementById(`${i * 3}-${(i + 1) * 3}`).innerHTML = `${i * 3}-${(i + 1) * 3} h<br><img src=\"https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png" width=\"100px\" height=\"100px\" alt="weather logo"> 
                <p>Temp: ${data.list[i].main.temp}°C</p> 
                <p>Humidity: ${data.list[i].main.humidity}%</p>`;
            }


            //the next 5 days forecast
            let min_temp = daysInfoArray[0][0].main.temp;
            let max_temp = daysInfoArray[0][0].main.temp;
            for (let i = 0; i < 5; i++) {
                weather_array = [];
                ave_temp = 0;
                for (let j = 0; j < daysInfoArray[i].length; j++) {
                    weather_array.push(daysInfoArray[i][j].weather[0].icon);
                    ave_temp += daysInfoArray[i][j].main.temp;
                    if (daysInfoArray[i][j].main.temp < min_temp) {
                        min_temp = daysInfoArray[i][j].main.temp;
                    }
                    if (daysInfoArray[i][j].main.temp > max_temp) {
                        max_temp = daysInfoArray[i][j].main.temp;
                    }
                }
                ave_temp = (ave_temp / daysInfoArray[i].length).toFixed(1);
                icon = findMode(weather_array)
                document.getElementById(`Day${i + 1}`).innerHTML = `<img src=\"https://openweathermap.org/img/wn/${icon}@2x.png" width=\"60px\" height=\"60px\"> <br>`
                    + `April ${dayArray[i]} <br>Ave temp: ${ave_temp}°C<br>Min: ${min_temp}°C <br>Max: ${max_temp}°C`;
            }
        })
}
