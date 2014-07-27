# AirHarvest

The Apple AirPlay and RAOP protocols are the foundation of Apple TV and
all AirPlay compatible hardware. The two protocols are continuesly
evolving and new features are added all the time. Clément Vasseur did [a
fantastic job documenting](http://nto.github.io/AirPlay.html) most of
the two protocols in 2012, but since then a lot have happended.

This project is a first step in trying to fully uncover the two
protocols.

Each new OS release for Apple TV and AirPort Express introduces slight
changes to the two protocols. So an important part of the reverse
engineering is to get snapshots of how the different OS and hardware
combinations expose them selfs on the network.

## Important note about privacy

Installing an running this software on your computer will collect and
send information about all AirPlay and RAOP compatible devices on your
network **to a public database**.

See below if you'd like to know what kind of information is collected.

## Installation

This is a Node.js module and requires the [Node.js package
manager](https://www.npmjs.org) to install.

```
npm install -g airharvest
```

## Run it!

Just run the `airharvest` command from your command line :)

## What does the collected data look like?

This is an example of what kind of RAOP data is collected:

```json
{
    "type": "raop",
    "port": 5000,
    "txt": {
        "cn": "0,1,2,3",
        "da": "true",
        "et": "0,3,5",
        "ft": "0x5A7FFFF7,0xE",
        "md": "0,1,2",
        "am": "AppleTV3,1",
        "pk": "****************************************************************",
        "sf": "0x44",
        "tp": "UDP",
        "vn": "65537",
        "vs": "200.54",
        "vv": "2"
    }
}
```

This is an example of what kind of AirPlay data is collected:

```json
{
    "type": "airplay",
    "port": 7000,
    "txt": {
        "deviceid": "***",
        "features": "0x5A7FFFF7,0xE",
        "flags": "0x44",
        "model": "AppleTV3,1",
        "pk": "****************************************************************",
        "srcvers": "200.54",
        "vv": "2"
    }
}
```

## License

MIT
