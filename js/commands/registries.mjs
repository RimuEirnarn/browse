import { bootSequence, systemLog } from "../boot.mjs"
import { register } from "../commands.mjs"
import { prompt } from "../modals.mjs"
import { toast } from "../toasts.mjs"
import { fetch_motd } from "../utilities.mjs"
import { update } from "../widget.mjs"

export function init_user_commands() {
  register("obsidian", "Open Obsidian vault", () => {
    window.open("obsidian://open?vault=Remembrance")
  })

  register("demo", "Demo commands for PoC modal", () => {
    prompt({
      title: "Demo Input", fields: [
        { id: "demo-input", label: "Demo Input", type: 'string', placeholder: "Type anything", required: true, validate(x) { return true } },
        { id: "demo-input-2", label: "Demo Input 2", type: 'string', placeholder: "Type anything", required: true, validate(x) { return true } }
      ]
    }).then((value) => {
      toast(`Input demo 1 -> ${value['demo-input']}\nInput demo 2 -> ${value['demo-input-2']}`)
    })
  }
  )

  register("note", "Make a note", () => {
    prompt({
      title: "Make a note for yourself", fields: [
        { id: "message", label: "Message", type: "string", placeholder: "Your message", required: true }
      ]
    }).then(value => {
      toast("Updating...")
      if (value.message == "!REMOVE") {
        localStorage.removeItem('note');
        update("notes")
        return
      }
      localStorage.setItem("notes", value.message)
      update("notes")
    })
  })

  register('motd', "Fetch MOTD", () => {
    fetch_motd().then(value => {
      toast(value.data)
    })
  })

  bootSequence.updateProgress()
}
