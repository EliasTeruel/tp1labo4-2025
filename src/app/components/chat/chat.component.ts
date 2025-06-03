import { Component, Input, Output, EventEmitter, signal, effect, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  providers: [DatePipe]
})
export class ChatComponent implements AfterViewInit {
  //@Input() userName = '';
  @Output() messageSent = new EventEmitter<string>();
  @ViewChild('messagesDiv') messagesDiv!: ElementRef;

  messages = signal<any[]>([]);
  newMessage = '';
  userName = '';

  constructor(private supabase: SupabaseService, private datePipe: DatePipe) {
    this.loadUser();
    this.loadMessages();
    this.listenToNewMessages();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  async loadMessages() {
    const { data, error } = await this.supabase.getMessages();
    console.log('Mensajes cargados:', data);
    console.log('Error:', error);
    if (data) this.messages.set(data);
    this.scrollToBottom();
  }

  async loadUser() {
    const session = await this.supabase.getSession();
    const userId = session?.user.id;

    if (userId) {
      const { data } = await this.supabase.getUserData(userId);
      this.userName = data?.name || 'Anónimo';
    } else {
      this.userName = 'Anónimo';
    }
  }
  async sendMessage() {
    if (!this.newMessage.trim()) return;
    console.log('Enviando mensaje:', this.newMessage, 'de', this.userName);

    const { error } = await this.supabase.sendMessage(this.newMessage, this.userName);
    if (error) console.error('Error al enviar mensaje:', error);

    this.messageSent.emit(this.newMessage);
    this.newMessage = '';
  }


  listenToNewMessages() {
    this.supabase.listenToMessages((msg: any) => {
      this.messages.update((old) => [...old, msg]);
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesDiv?.nativeElement?.scrollTo({
        top: this.messagesDiv.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 50);
  }

  formatMessageDate(dateString: string): string {
    const messageDate = new Date(dateString);
    const today = new Date();

    if (messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()) {
      return this.datePipe.transform(messageDate, 'shortTime') || '';
    } else {
      return this.datePipe.transform(messageDate, 'medium') || '';
    }
  }


}
