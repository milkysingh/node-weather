// Welcome
const yargs = require("yargs");
const axios = require("axios");
var toCelcius = require("./toCelcius");
var argv = yargs.usage('Usage: $0 -a [address] ')
    .example('$0 -a Budapest ', 'Get the weather information for Budapest.')
    .example('$0 -a "San Francisco" ', 'Get the weather information for San Francisco.')
    .example('$0 d', 'Use the default location to determine the weather.')


    .options({
        a: {

            describe: "Address to fetch weather for, if not given a default address will be used.",
            string: true,
            alias: "address"
        },
        d: {
            describe: "Press d to get the weather of the default location",
            alias: "Default Address"
        }
    }).help()
    .alias("help", "h")
    .argv;

var geoCode;
if (argv._[0] === "d") {

    geoCode = encodeURIComponent("jalandhar");
} else {
    geoCode = encodeURIComponent(argv.a);
}
if (argv.address === undefined && argv._[0] === undefined) {
    geoCode = "00000";
}
var locationUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${geoCode}`;


axios.get(locationUrl).then((res) => {
        if (res.data.status === "ZERO_RESULTS") {
            throw new Error("Enter a valid address. type 'h' for more options. Ex: 'node app -h'");
        }
        console.log(res.data.results[0].formatted_address);
        var lat = res.data.results[0].geometry.location.lat;
        var lng = res.data.results[0].geometry.location.lng;

        var weatherUrl = `https://api.darksky.net/forecast/caef094daa135005a9c5c1a293d45448/${lat},${lng}`
        return axios.get(weatherUrl);

    }).then((res) => {
        var temperature = toCelcius(res.data.currently.temperature).toPrecision(3);
        var apparantTemp = toCelcius(res.data.currently.apparentTemperature).toPrecision(3);
        var precipitation = res.data.currently.precipProbability;
        var wind = res.data.currently.windSpeed;

        console.log(`Current Temp :${temperature}*C\n Feels like : ${apparantTemp}\n Precipitaion : ${precipitation}% \n WindSpeed : ${wind}mph`);
    })
    .catch((err) => {
        if (err.code === "ENOTFOUND") {
            console.log("Unable to connect to Api's");
        } else {
            console.log(err.message);
        }
    })