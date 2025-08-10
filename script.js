
        class WeatherApp {
            constructor() {
                this.apiKey = 'c7b8b3c05521631efa9c361ebb1d0021';
                this.baseUrl = 'https://api.openweathermap.org/data/2.5';

                this.cityInput = document.getElementById('cityInput');
                this.searchBtn = document.getElementById('searchBtn');
                this.loading = document.getElementById('loading');
                this.weatherInfo = document.getElementById('weatherInfo');
                this.errorMessage = document.getElementById('errorMessage');
                this.weatherAnimation = document.getElementById('weatherAnimation');
                this.body = document.body;

                this.initializeEventListeners();
                this.loadDefaultWeather();
            }

            initializeEventListeners() {
                this.searchBtn.addEventListener('click', () => this.searchWeather());
                this.cityInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.searchWeather();
                });
            }

            async loadDefaultWeather() {
                try {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => this.getWeatherByCoords(position.coords.latitude, position.coords.longitude),
                            () => this.getWeatherByCity('London')
                        );
                    } else {
                        this.getWeatherByCity('London');
                    }
                } catch (error) {
                    this.getWeatherByCity('London');
                }
            }

            async searchWeather() {
                const city = this.cityInput.value.trim();
                if (!city) return;
                await this.getWeatherByCity(city);
            }

            async getWeatherByCity(city) {
                this.showLoading();
                try {
                    const response = await fetch(`${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`);
                    if (!response.ok) throw new Error('City not found');
                    const data = await response.json();
                    await this.getHourlyForecast(data.coord.lat, data.coord.lon);
                    this.displayWeather(data);
                } catch (error) {
                    this.showError();
                }
            }

            async getWeatherByCoords(lat, lon) {
                this.showLoading();
                try {
                    const response = await fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`);
                    if (!response.ok) throw new Error('Location not found');
                    const data = await response.json();
                    await this.getHourlyForecast(lat, lon);
                    this.displayWeather(data);
                } catch (error) {
                    this.showError();
                }
            }

            async getHourlyForecast(lat, lon) {
                try {
                    const response = await fetch(`${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`);
                    if (!response.ok) throw new Error('Forecast not found');
                    const data = await response.json();
                    this.hourlyData = data.list.slice(0, 8);
                } catch (error) {
                    console.error('Error fetching forecast:', error);
                    this.hourlyData = [];
                }
            }

            displayWeather(data) {
                const temp = Math.round(data.main.temp);
                document.getElementById('temp').textContent = temp;
                document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
                document.getElementById('description').textContent = data.weather[0].description;
                document.getElementById('humidity').textContent = `${data.main.humidity}%`;
                document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
                document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
                document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;

                this.updateBackground(temp, data.weather[0].main);
                this.updateTempAnimation(temp);
                this.displayHourlyForecast();
                this.hideLoading();
                this.showWeatherInfo();
            }

            updateBackground(temp, weatherMain) {
                this.body.className = '';
                if (temp >= 30) this.body.classList.add('hot');
                else if (temp >= 20) this.body.classList.add('warm');
                else if (temp >= 10) this.body.classList.add('mild');
                else if (temp >= 0) this.body.classList.add('cool');
                else if (temp >= -10) this.body.classList.add('cold');
                else this.body.classList.add('freezing');

                this.updateWeatherAnimation(weatherMain);
            }

            updateWeatherAnimation(weatherMain) {
                this.weatherAnimation.innerHTML = '';

                switch (weatherMain.toLowerCase()) {
                    case 'clear':
                        this.createSun();
                        this.createClouds(2);
                        break;
                    case 'clouds':
                        this.createClouds(5);
                        break;
                    case 'rain':
                    case 'drizzle':
                        this.createClouds(4);
                        this.createRain();
                        break;
                    case 'snow':
                        this.createClouds(3);
                        this.createSnow();
                        break;
                    case 'thunderstorm':
                        this.createClouds(4);
                        this.createRain();
                        this.createThunderstorm();
                        break;
                    default:
                        this.createClouds(3);
                }
            }




            updateTempAnimation(temp) {
                const container = document.getElementById('tempAnimation');
                container.innerHTML = ''; // Clear old animation

                if (temp >= 30) {
                    // Very hot → flame
                    const flame = document.createElement('div');
                    flame.className = 'temp-flame';
                    container.appendChild(flame);
                } else if (temp >= 20) {
                    // Warm → sun
                    const sun = document.createElement('div');
                    sun.className = 'temp-sun';
                    container.appendChild(sun);
                } else if (temp <= 0) {
                    // Cold → snowflake icon
                    const snowflake = document.createElement('div');
                    snowflake.className = 'temp-snowflake';
                    snowflake.innerHTML = '❄';
                    container.appendChild(snowflake);
                }
            }

            createSun() {
                const sun = document.createElement('div');
                sun.className = 'sun';
                this.weatherAnimation.appendChild(sun);

                // Add sun rays (optional, not animated by default)
                // for (let i = 0; i < 12; i++) {
                //     const ray = document.createElement('div');
                //     ray.className = 'sun-ray';
                //     ray.style.transform = `rotate(${i * 30}deg)`;
                //     ray.style.animationDelay = `${i * 0.1}s`;
                //     sun.appendChild(ray);
                // }
            }

               createClouds(count) {
                for (let i = 0; i < count; i++) {
                    const cloud = document.createElement('div');
                    cloud.className = 'cloud';

                    // Main position and size
                    const baseSize = Math.random() * 60 + 60;
                    cloud.style.top = `${Math.random() * 50}%`;
                    cloud.style.left = `${Math.random() * 80}%`;
                    cloud.style.width = `${baseSize * 1.4}px`;
                    cloud.style.height = `${baseSize}px`;
                    cloud.style.animationDuration = `${Math.random() * 20 + 20}s`;
                    cloud.style.animationDelay = `${Math.random() * 10}s`;
                    cloud.style.opacity = (0.8 + Math.random() * 0.2).toString();

                    // Blob details (positions and sizes)
                    const blobs = [
                        { w: baseSize, h: baseSize * 0.7, l: 0, t: baseSize * 0.3, g: '#fff', o: 1 },
                        { w: baseSize * 0.7, h: baseSize * 0.5, l: baseSize * 0.5, t: baseSize * 0.2, g: '#f5f8ff', o: 0.9 },
                        { w: baseSize * 0.6, h: baseSize * 0.5, l: baseSize * 0.3, t: baseSize * 0.05, g: '#e0eaff', o: 0.8 },
                        { w: baseSize * 0.5, h: baseSize * 0.4, l: baseSize * 0.8, t: baseSize * 0.4, g: '#e0eaff', o: 0.7 }
                    ];

                    blobs.forEach(b => {
                        const blob = document.createElement('div');
                        blob.className = 'cloud-part';
                        blob.style.width = `${b.w}px`;
                        blob.style.height = `${b.h}px`;
                        blob.style.left = `${b.l}px`;
                        blob.style.top = `${b.t}px`;
                        blob.style.opacity = b.o;
                        blob.style.background = `radial-gradient(circle at 60% 40%, ${b.g} 80%, transparent 100%)`;
                        blob.style.boxShadow = `0 0 30px 10px rgba(173,216,230,0.15)`;
                        cloud.appendChild(blob);
                    });

                    this.weatherAnimation.appendChild(cloud);
                }
            }


            createRain() {
                for (let i = 0; i < 80; i++) {
                    const drop = document.createElement('div');
                    drop.className = 'raindrop';
                    drop.style.left = `${Math.random() * 100}%`;
                    drop.style.animationDelay = `${Math.random()}s`;
                    drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
                    this.weatherAnimation.appendChild(drop);
                }
            }

            createSnow() {
                for (let i = 0; i < 50; i++) {
                    const flake = document.createElement('div');
                    flake.className = 'snowflake';
                    flake.innerHTML = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
                    flake.style.left = `${Math.random() * 100}%`;
                    flake.style.fontSize = `${Math.random() * 12 + 10}px`;
                    flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
                    flake.style.animationDelay = `${Math.random() * 5}s`;
                    this.weatherAnimation.appendChild(flake);
                }
            }

            createThunderstorm() {
                // Lightning effect: flashes occasionally
                const flash = () => {
                    const lightning = document.createElement('div');
                    lightning.style.position = 'absolute';
                    lightning.style.width = '6px';
                    lightning.style.height = '80px';
                    lightning.style.background = 'linear-gradient(to bottom, #fff, yellow, #fff)';
                    lightning.style.left = `${Math.random() * 100}%`;
                    lightning.style.top = `${Math.random() * 30}%`;
                    lightning.style.opacity = '0.7';
                    lightning.style.borderRadius = '5px';
                    lightning.style.boxShadow = '0 0 30px 10px #fff, 0 0 70px 30px yellow';
                    this.weatherAnimation.appendChild(lightning);

                    setTimeout(() => {
                        if (lightning.parentNode) lightning.parentNode.removeChild(lightning);
                    }, 300);
                };
                // flash occasionally
                if (!this._thunderInterval) {
                    this._thunderInterval = setInterval(() => {
                        if (Math.random() > 0.7) flash();
                    }, 1500);
                }
            }

            getWeatherIcon(weatherMain) {
                const icons = {
                    'Clear': 'fas fa-sun',
                    'Clouds': 'fas fa-cloud',
                    'Rain': 'fas fa-cloud-rain',
                    'Drizzle': 'fas fa-cloud-rain',
                    'Thunderstorm': 'fas fa-bolt',
                    'Snow': 'fas fa-snowflake',
                    'Mist': 'fas fa-smog',
                    'Fog': 'fas fa-smog'
                };
                return icons[weatherMain] || 'fas fa-cloud';
            }

            displayHourlyForecast() {
                const container = document.querySelector('.forecast-container');
                container.innerHTML = '';

                if (!this.hourlyData || this.hourlyData.length === 0) return;

                this.hourlyData.forEach((item, index) => {
                    const time = new Date(item.dt * 1000);
                    const hours = time.getHours().toString().padStart(2, '0');
                    const temp = Math.round(item.main.temp);
                    const icon = this.getWeatherIcon(item.weather[0].main);

                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    forecastItem.style.animationDelay = `${index * 0.1}s`;
                    forecastItem.innerHTML = `
                        <div class="forecast-time">${hours}:00</div>
                        <div class="forecast-icon"><i class="${icon}"></i></div>
                        <div class="forecast-temp">${temp}°</div>
                    `;
                    container.appendChild(forecastItem);
                });
            }

            showLoading() {
                this.loading.style.display = 'block';
                this.weatherInfo.style.display = 'none';
                this.errorMessage.style.display = 'none';
            }

            hideLoading() {
                this.loading.style.display = 'none';
            }

            showWeatherInfo() {
                this.weatherInfo.style.display = 'block';
                this.errorMessage.style.display = 'none';
                document.getElementById('hourlyForecast').style.opacity = '1';
            }

            showError() {
                this.hideLoading();
                this.weatherInfo.style.display = 'none';
                this.errorMessage.style.display = 'block';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new WeatherApp();
        });