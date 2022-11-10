import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isReady = false
  private ffmpeg
  isRunning = false

  constructor() {
    this.ffmpeg = createFFmpeg({ log:true })
   }

  async init(){
    if(this.isReady){
      return
    }
    await this.ffmpeg.load()
    this.isReady = true
  }

  async getScreenshot(file:File){
    this.isReady =true
    const data = await fetchFile(file)

    this.ffmpeg.FS('writeFile', file.name, data)

    const seconds = [1,2,3]
    const commands: string[] = []

    seconds.forEach( second => {
      commands.push(
        '-i', file.name,
      '-ss', `00:00:0${second}`,
      '-frames:v', '1',
      '-filter:v', 'scale=520:-1',
      `output_0${second}.png`
      )
    })

    await this.ffmpeg.run(
     ...commands
    )

    const screenshots: string[]=[]

    seconds.forEach(second => {
      const sereenshotFile =this.ffmpeg.FS('readFile', `output_0${second}.png`)
      const screenshotBlob = new Blob(
        [sereenshotFile.buffer], {
          type: 'image/png'
        }
      )
      const screenshotURL = URL.createObjectURL(screenshotBlob)

      screenshots.push(screenshotURL)
    })
    this.isRunning = false
    return screenshots
  }

  async blobFromURL(url: string){

    const response = await fetch(url)
    const blob = await response.blob()
    return blob
  }
}