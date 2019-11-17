## Tide database tools

These are a collection of tools used to convert database formats of water levels to ones that are readable by Xtide's Harmgen.

### Hawaii

The command `hawaii-converter.js` converts DAT files from the (University of Hawaii's Sea Level Center)[http://uhslc.soest.hawaii.edu/data/?fd#uh109]. The first argument should be the data file, the second where you want the output to be.

```shell
node hawaii-converter.js input.dat output.txt
```
