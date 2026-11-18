#!/bin/bash
curl https://api.weather.gov/gridpoints/GYX/24,54/forecast 2>/dev/null |
  jq -r .properties.periods[0].detailedForecast
