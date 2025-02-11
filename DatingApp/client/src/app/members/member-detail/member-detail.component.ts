import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { Member } from 'src/app/models/member'
import { Message } from 'src/app/models/message'
import { User } from 'src/app/models/user'
import { AccountService } from 'src/app/services/account.service'
import { MembersService } from 'src/app/services/members.service'
import { PresenceService } from 'src/app/services/presence.service'

import { MemberCardComponent } from '../member-card/member-card.component'
import { MessageService } from './../../services/message.service'

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  member!: Member
  galleryOptions!: NgxGalleryOptions[]
  galleryImages!: NgxGalleryImage[]
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent
  activeTab: TabDirective
  messages: Message[] = []
  subscription: Subscription
  user: User
  //memberCard: MemberCardComponent

  constructor(
    private memberService: MembersService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    public presence: PresenceService,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user as User))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
    this.messageService.stopHubConnection()
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.member = data['member']
    })

    this.galleryImages = this.getImages()

    this.subscription = this.route.queryParams.subscribe((params: Params) => {
      this.selectTab(params.tab || 0)
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
      },
    ]
  }

  getImages(): NgxGalleryImage[] {
    const imgUrls: NgxGalleryImage[] = []
    for (const photo of this.member.photos) {
      imgUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
      })
    }
    return imgUrls
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0) {
      this.messageService.createHubConnection(this.user, this.member.username)
      // this.loadMessages()
    } else {
      this.messageService.stopHubConnection()
    }
  }

  // loadMessages() {
  //   this.messageService
  //     .getMessageThread(this.member.username)
  //     .subscribe((m) => {
  //       this.messages = m
  //     })
  // }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true
  }

  // toggleLike(likedToggle: MemberCardComponent) {}
}
