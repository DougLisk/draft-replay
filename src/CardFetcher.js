import raw from './log.txt';
import React, {Component} from 'react';
import {FilePicker} from 'react-file-picker';
import mammoth from "mammoth";

class CardFetcher extends Component{

  state = { 
    data: [],
    pack: 0,
    loading: true,
    images: [],
    pick_images: [],
    hightlight: false,
    deck: [],
    raw_text: ""
  }

  showFile = () => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
         var preview = document.getElementById('show-text');
         var file = document.querySelector('input[type=file]').files[0];
         var reader = new FileReader()

         var textFile = /text.*/;
        const scope = this
         if (file.type.match(textFile)) {
            reader.onload = function (event) {
              scope.setState({
                raw_text: event.target.result
              }, () => {
                scope.process_file()
              });
            }
         } else {
            preview.innerHTML = "<span class='error'>It doesn't seem to be a text file!</span>";
         }
         reader.readAsText(file);

   } else {
      alert("Your browser is too old to support HTML5 File API");
   }
  }

  fetch_images() {
    let current_pack = this.state.packs[this.state.pack];
    let images = []
    let pick_images = this.state.pick_images
    let listItems
    if(current_pack) {
      for(let i=0; i<current_pack.length; i++){
        let name
        if (current_pack[i].includes("//")) {
          name = current_pack[i].split("//")[0]
        } else {
          name = current_pack[i]
        }
        fetch("https://api.scryfall.com/cards/named?fuzzy="+name)
          .then(response => response.json())
          .then(json => {
            let image
            if (json.hasOwnProperty('image_uris')) {
              image = (json.image_uris.png)
            } else {
              image = (json.card_faces[0].image_uris.png)
            }
            if (this.state.picks.includes(current_pack[i])){
              pick_images.push(image)
            }
            images.push(image)
            this.setState({images: images, pick_images: pick_images})
          })
      }
    }
  }

  process_file() {
    let lines = this.state.raw_text.split('\n')
    let packs = []
    let picks = []
    for (var i=0; i<lines.length; i++){
      if (lines[i].includes('Pack')) {
        let pack = []
        i++
        picks.push(lines[i])
        while((lines[i] != '') && (lines[i]!=undefined)) {
          pack.push(lines[i])
          i++
        }
        packs.push(pack)
      }
    }
    this.setState({
      packs: packs,
      picks: picks
    }, () => {
      this.fetch_images()
    });
  }

  next_pack() {
    let picked_card
    this.state.images.map(card => {
      if (this.state.pick_images.includes(card)){
        picked_card = card
      }
    })
    let deck = this.state.deck
    deck.push(picked_card)
    this.setState({
      pack: this.state.pack+1,
      highlight: false,
      deck: deck
    }, () => {
      this.fetch_images()
    });
  }

  show_pick() {
    this.setState({highlight: !this.state.highlight})
  }
  
  render() {
    var style = {width: (66*4), height: (88*4), margin: 15}
    var pick_style = {width: (66*4), height: (88*4), margin: 15, boxShadow: "10px 10px 10px #FFD700"}
    const packItems = this.state.images.map((d) => this.state.pick_images.includes(d) ? <img src={d} tags={"pick"} style={this.state.highlight? pick_style : style}/> : <img src={d} style={style}/>);
    const pickedItems = this.state.deck.map((d) => <img src={d} style={style}/>);
    return (
      <div>
      <header>
        Pack {Math.floor((this.state.pack)/15)+1} Pick {((this.state.pack)%15)+1}
      </header>
        <input type="file" onChange={this.showFile} />
        <div id="show-text">Choose text File</div>
        <div>
          {this.state.pack < 44 ? <button onClick={this.next_pack.bind(this)}>Next Pack</button> : <div/>}
          <button onClick={this.show_pick.bind(this)}>Show Pick</button>
        </div>
        Current Pack:
        <div>
          {this.state.images ? packItems : ""}
        </div> 
        Picked So Far:
        <div>
          {this.state.pick_images ? pickedItems : ""}
        </div>
      </div>
    );
  }
}

export default CardFetcher