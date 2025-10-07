type Level2Required<T> = {
    [P in keyof T]-?: Required<T[P]>;
};

export type AddressListUnsanitized = Array<[string, number?]>;
export type AddressList = Level2Required<AddressListUnsanitized>;

/** @deprecated Part of python migration. */
const process = {
  argv: ["fake_process.js"],
  env: {
    ADDR: '[("127.0.0.1",7000),("192.168.2.232",6454)]',
  }

};

/**
 * Convert string to array of tuples
 * Parameter s can be:
 *   abcdef
 *   'abcdef'
 *   "abcdef"
 *   ("abcdef", 123)
 *   [("abcdef", 123)]
 * 
 * @param {String} str The string to convert to tuple array
 * @deprecated Need to migrate away from python implementation.
 */
function toTuppleArray(str: string)
{
    // TODO: implement properly
    // For JSON, replace round brackets
    const json = str.replace(/(.*?)\((.*?)\)(.*?)/g, "$1[$2]$3").replace(/'/g,'"');

    return JSON.parse(json) as AddressList;
}

/**
 * Get IP address from param or environment
 * 
 * @param {String[]} _addr The IP address
 * @deprecated Need to migrate away from python implementation.
 */
export function getAddr(_addr?: AddressListUnsanitized)
{
    const defaultPort = 6454;

    let addr = _addr;//[["192.168.2.232", 6454]]; // 89.255
    if (!_addr || !Array.isArray(_addr))
    {
        // Check if addr= argument given or ADDR env. variable set
        if (process.env.ADDR)
        {
            addr = toTuppleArray(process.env.ADDR)
        }
        else if (process.argv.length > 1)
        {
            process.argv.forEach((arg) => {
                if (arg.startsWith("addr="))
                    addr = toTuppleArray(arg.substring(5))
      
            })
        }
    }
    // check for missing port and set to default
    addr!.forEach((address) => {
        if (address.length === 1)
            address.push(defaultPort);
    });

    // console.debug( "Addresses used:", addr );
    return addr as AddressList;
}
