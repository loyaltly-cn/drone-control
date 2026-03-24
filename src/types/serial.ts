/**串口*/
export interface Serial{
    port: SerialPort | null
    reader: ReadableStreamDefaultReader<Uint8Array> | null
}