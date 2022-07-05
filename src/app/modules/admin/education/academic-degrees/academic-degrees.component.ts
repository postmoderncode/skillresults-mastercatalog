import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-academic-degrees',
  templateUrl: './academic-degrees.component.html',
  styleUrls: ['./academic-degrees.component.scss']
})
export class AcademicDegreesComponent implements OnInit {

  //Initialize Varables
  //-------------------

  //Scroll element
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;

  //Current User
  fbuser = JSON.parse(localStorage.getItem('fbuser'));

  //Confirmation Dialog
  dialogconfigForm: FormGroup;

  //Controls Edit Datepicker
  editDate: any;

  //Empty Model
  model = new Education();

  //Graduation Label Text
  gradDate = 'Date of Completion';

  //Firebase Observables
  item: Observable<any>;
  items: Observable<any[]>;
  listRef: AngularFireList<any>;

  //Form Visibility Modifiers
  showadditem = false;
  showedititem = false;
  stateselected = false;

  //Autocomplete Data
  schoolfilteredData;
  fieldfilteredData;
  schooloptions;

  fieldoptions: string[] = ['Accounting', 'Advertising', 'African-American Studies', 'Agriculture', 'Animal Science', 'Anthropology', 'Aerospace Engineering', 'Archaeology', 'Architecture', 'Art History', 'Arts Management', 'Asian-American Studies', 'Astronomy and Astrophysics', 'Bilingual/Crosscultural Education', 'Athletic Training', 'Biochemistry', 'Biology', 'Biomedical Engineering', 'Business', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 'Classical Studies', 'Communication Disorders Sciences and Services', 'Communications', 'Comparative Literature', 'Computer Engineering', 'Computer Information Systems', 'Computer Science', 'Construction Services', 'Cosmetology Services', 'Creative Writing', 'Criminology', 'Culinary Arts', 'Cybersecurity', 'Design', 'Economics', 'Education', 'Electrical Engineering', 'Elementary Education', 'Engineering', 'English Language and Literature', 'Entomology', 'Environmental Engineering', 'Film and Video Production', 'Film-Video Arts', 'Finance', 'Fine Arts', 'Fire Safety Science', 'Food Science', 'Foreign Languages', 'Forestry', 'Gender Studies', 'Genetics', 'Geology', 'Graphic Design', 'Health Sciences', 'History', 'Hospitality Management', 'Human Ecology', 'Industrial Technology', 'International Business', 'International Relations', 'Journalism', 'Kinesiology', 'Latin American Studies', 'Liberal Studies', 'Library Science', 'Linguistics', 'Logistics Management', 'Marketing', 'Mathematics', 'Mechanical Engineering', 'Medical Technology', 'Metallurgical Engineering', 'Meteorology', 'Microbiology', 'Military Technology', 'Mining and Mineral Engineering', 'Music', 'Mythology and Folklore', 'Naval Architecture and Marine Engineering', 'Neuroscience', 'Nuclear Engineering', 'Nursing', 'Oceanography', 'Occupational Health and Safety', 'Parks, Recreation, and Leisure Studies', 'Performing Arts', 'Petroleum Engineering', 'Pharmacology', 'Philosophy', 'Photography', 'Physics', 'Physiology', 'Plant Science', 'Political Science', 'Pre-Law', 'Psychology', 'Public Administration', 'Puppetry', 'Religious Studies', 'Rhetoric', 'Social Work', 'Sociology', 'Software Engineering', 'Special Education', 'Sports Medicine', 'Statistics', 'Student Counseling', 'Supply Chain Management', 'Theater Arts', 'Viticulture', 'Zoology']

  //Dropdown List Data
  degreetypesfilteredData;

  states = [{ "name": "Alabama", "abbreviation": "AL" }, { "name": "Alaska", "abbreviation": "AK" }, { "name": "Arizona", "abbreviation": "AZ" }, { "name": "Arkansas", "abbreviation": "AR" }, { "name": "California", "abbreviation": "CA" }, { "name": "Colorado", "abbreviation": "CO" }, { "name": "Connecticut", "abbreviation": "CT" }, { "name": "Delaware", "abbreviation": "DE" }, { "name": "Florida", "abbreviation": "FL" }, { "name": "Georgia", "abbreviation": "GA" }, { "name": "Hawaii", "abbreviation": "HI" }, { "name": "Idaho", "abbreviation": "ID" }, { "name": "Illinois", "abbreviation": "IL" }, { "name": "Indiana", "abbreviation": "IN" }, { "name": "Iowa", "abbreviation": "IA" }, { "name": "Kansas", "abbreviation": "KS" }, { "name": "Kentucky", "abbreviation": "KY" }, { "name": "Louisiana", "abbreviation": "LA" }, { "name": "Maine", "abbreviation": "ME" }, { "name": "Maryland", "abbreviation": "MD" }, { "name": "Massachusetts", "abbreviation": "MA" }, { "name": "Michigan", "abbreviation": "MI" }, { "name": "Minnesota", "abbreviation": "MN" }, { "name": "Mississippi", "abbreviation": "MS" }, { "name": "Missouri", "abbreviation": "MO" }, { "name": "Montana", "abbreviation": "MT" }, { "name": "Nebraska", "abbreviation": "NE" }, { "name": "Nevada", "abbreviation": "NV" }, { "name": "New Hampshire", "abbreviation": "NH" }, { "name": "New Jersey", "abbreviation": "NJ" }, { "name": "New Mexico", "abbreviation": "NM" }, { "name": "New York", "abbreviation": "NY" }, { "name": "North Carolina", "abbreviation": "NC" }, { "name": "North Dakota", "abbreviation": "ND" }, { "name": "Ohio", "abbreviation": "OH" }, { "name": "Oklahoma", "abbreviation": "OK" }, { "name": "Oregon", "abbreviation": "OR" }, { "name": "Pennsylvania", "abbreviation": "PA" }, { "name": "Rhode Island", "abbreviation": "RI" }, { "name": "South Carolina", "abbreviation": "SC" }, { "name": "South Dakota", "abbreviation": "SD" }, { "name": "Tennessee", "abbreviation": "TN" }, { "name": "Texas", "abbreviation": "TX" }, { "name": "Utah", "abbreviation": "UT" }, { "name": "Vermont", "abbreviation": "VT" }, { "name": "Virginia", "abbreviation": "VA" }, { "name": "Washington", "abbreviation": "WA" }, { "name": "West Virginia", "abbreviation": "WV" }, { "name": "Wisconsin", "abbreviation": "WI" }, { "name": "Wyoming", "abbreviation": "WY" }];

  degreelevels =
    [
      { level: '1', name: 'Associate' },
      { level: '2', name: 'Bachelors' },
      { level: '3', name: 'Masters' },
      { level: '4', name: 'Doctoral' }
    ];

  degreetypes =
    [
      { name: 'Associate of Arts (AA)', degreeLevel: '1' },
      { name: 'Associate of Science (AS)', degreeLevel: '1' },
      { name: 'Associate of Applied Science (AAS)', degreeLevel: '1' },
      { name: 'Associate of Applied Arts and Science (AAAS)', degreeLevel: '1' },
      { name: 'Bachelor of Architecture (B.Arch.)', degreeLevel: '2' },
      { name: 'Bachelor of Applied Arts and Science (BAAS)', degreeLevel: '2' },
      { name: 'Bachelor of Applied Science (BAS)', degreeLevel: '2' },
      { name: 'Bachelor of Arts (B.A.)', degreeLevel: '2' },
      { name: 'Bachelor of Business Administration(BBA)', degreeLevel: '2' },
      { name: 'Bachelor of Fine Arts (BFA)', degreeLevel: '2' },
      { name: 'Bachelor of Science (B.S.)', degreeLevel: '2' },
      { name: 'Master of Arts (M.A.)', degreeLevel: '3' },
      { name: 'Master of Business Administration (MBA)', degreeLevel: '3' },
      { name: 'Master of Education (M.Ed.)', degreeLevel: '3' },
      { name: 'Master of Fine Arts (MFA)', degreeLevel: '3' },
      { name: 'Master of Science (M.S.)', degreeLevel: '3' },
      { name: 'Master of Laws (LL.M.)', degreeLevel: '3' },
      { name: 'Master of Public Administration (MPA)', degreeLevel: '3' },
      { name: 'Master of Public Health (MPH)', degreeLevel: '3' },
      { name: 'Master of Publishing (M.Pub.)', degreeLevel: '3' },
      { name: 'Master of Social Work (MSW)', degreeLevel: '3' },
      { name: 'Doctor of Business Administration (DBA)', degreeLevel: '4' },
      { name: 'Doctor of Dental Surgery (DDS)', degreeLevel: '4' },
      { name: 'Doctor of Education (Ed.D.)', degreeLevel: '4' },
      { name: 'Doctor of Medicine (M.D.)', degreeLevel: '4' },
      { name: 'Doctor of Pharmacy (Pharm.D.)', degreeLevel: '4' },
      { name: 'Doctor of Philosophy (Ph.D.)', degreeLevel: '4' },
      { name: 'Doctor of Psychology (Psy.D.)', degreeLevel: '4' },
      { name: 'Juris Doctor (J.D.)', degreeLevel: '4' }

    ];


  /**
   * Constructor
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    public db: AngularFireDatabase
  ) { }

  //Form Visibility Modifiers

  onShowAddForm(): void {
    this.showedititem = false;
    this.showadditem = true;
    this.cdkScrollable.scrollTo({ top: 0 });

  }

  onHideAddForm(): void {
    this.showadditem = false;
    this.cdkScrollable.scrollTo({ top: 0 });

  }

  onShowEditForm(key): void {
    this.showadditem = false;
    this.showedititem = true;
    this.degreetypesfilteredData = this.degreetypes;
    this.cdkScrollable.scrollTo({ top: 0 });

    //Define Observable
    this.item = this.db.object('/users/' + this.fbuser.id + '/degrees/' + key).valueChanges();

    //Subscribe to Observable
    this.item.subscribe((item) => {
      this.model = new Education(key, item.state, item.institution, item.degreelevel, item.degreetype, item.major, item.minor, item.completed, item.awardedon, item.created, item.modeified, item.user);
      this.editDate = item.awardedon;
      console.log(this.editDate);
    });

    console.log(key + 'has been selected to edit');

  }

  onHideEditForm(): void {
    this.showedititem = false;
    this.cdkScrollable.scrollTo({ top: 0 });

  }

  onAdd(): void {

    this.listRef = this.db.list('/users/' + this.fbuser.id + '/degrees');

    //Cast model to variable for formReset
    const mstate: string = this.model.state;
    const minstitution: string = this.model.institution;
    const mdegreelevel: string = this.model.degreelevel;
    const mdegreetype: string = this.model.degreetype;
    const mmajor: string = this.model.major;
    const mminor: string = this.model.minor;
    const mcompleted: boolean = this.model.completed;
    const mawardedon: string = this.model.awardedon;
    const mdatenow = Math.floor(Date.now());

    //Define Promise
    const promiseAddItem = this.listRef
      .push({ state: mstate, institution: minstitution, degreelevel: mdegreelevel, degreetype: mdegreetype, major: mmajor, minor: mminor, completed: mcompleted, awardedon: mawardedon, created: mdatenow, modified: mdatenow, user: this.fbuser.id });

    //Call Promise
    promiseAddItem
      .then(_ => this.db.object('/degrees/' + this.fbuser.id + '/' + _.key)
        .update({ state: mstate, institution: minstitution, degreelevel: mdegreelevel, degreetype: mdegreetype, major: mmajor, minor: mminor, completed: mcompleted, awardedon: mawardedon, created: mdatenow, modified: mdatenow, user: this.fbuser.id }))
      .then(_ => this.showadditem = false)
      .catch(err => console.log(err, 'Error Submitting Degree!'));

    //Increment Count
    this.db.object('/counts/' + this.fbuser.id + '/degrees').query.ref.transaction((likes) => {
      if (likes === null) {
        return likes = 1;
      } else {
        return likes + 1;
      }
    });

    this.cdkScrollable.scrollTo({ top: 0 });

  }

  onEdit(key): void {

    //Cast model to variable for formReset
    const mstate: string = this.model.state;
    const minstitution: string = this.model.institution;
    const mdegreelevel: string = this.model.degreelevel;
    const mdegreetype: string = this.model.degreetype;
    const mmajor: string = this.model.major;
    const mminor: string = this.model.minor;
    const mcompleted: boolean = this.model.completed;
    const mawardedon: string = this.model.awardedon;
    const mdatenow = Math.floor(Date.now());

    this.db.object('/degrees/' + this.fbuser.id + '/' + key)
      .update({ state: mstate, institution: minstitution, degreelevel: mdegreelevel, degreetype: mdegreetype, major: mmajor, minor: mminor, completed: mcompleted, awardedon: mawardedon, modified: mdatenow, user: this.fbuser.id });

    this.db.object('/users/' + this.fbuser.id + '/degrees/' + key)
      .update({ state: mstate, institution: minstitution, degreelevel: mdegreelevel, degreetype: mdegreetype, major: mmajor, minor: mminor, completed: mcompleted, awardedon: mawardedon, modified: mdatenow, user: this.fbuser.id });

    this.showedititem = false;
    this.cdkScrollable.scrollTo({ top: 0 });

    console.log(key + ' edited');
  }


  onDelete(key): void {
    this.db.object('/users/' + this.fbuser.id + '/degrees/' + key).remove();
    this.db.object('/degrees/' + this.fbuser.id + '/' + key).remove();

    //Decrement Count
    this.db.object('/counts/' + this.fbuser.id + '/degrees').query.ref.transaction((likes) => {
      if (likes === null) {
        return likes = 0;
      } else {
        return likes - 1;
      }
    });

    console.log(key + ' deleted');

  }


  //Calendar Change Event to set Model
  onDateChange(event: MatDatepickerInputEvent<any>, control: AbstractControl): void {

    this.model.awardedon = ((event.value.valueOf()).toString());

  }


  //Degree Completed Checkbox
  onCompletedChecked($event): void {
    if ($event.checked === true) { this.gradDate = 'Date of Completion'; this.model.completed = true; }
    else { this.gradDate = 'Expected Graduation Date'; this.model.completed = false; }
  }


  //Filter for Field of Study Autocomplete
  applyFilterFields(evt: string): void {
    evt = evt + '';
    if (!evt) { this.fieldfilteredData = this.fieldoptions; }
    else {
      this.fieldfilteredData = this.fieldoptions.filter(item => (item + '') === evt || item.toLocaleLowerCase().indexOf(evt.toLocaleLowerCase()) >= 0);
    }
  }


  //Filter for Institution Autocomplete
  applyFilterSchools(evt: string): void {
    evt = evt + '';
    if (!evt) { this.schoolfilteredData = this.schooloptions; }
    else {
      this.schoolfilteredData = this.schooloptions.filter(item => (item + '') === evt || item.name.toLocaleLowerCase().indexOf(evt.toLocaleLowerCase()) >= 0);
    }
  }


  //Change fileter of degree types based on degree level dropdown
  onDegreeLevelChanged(ob): void {

    this.degreetypesfilteredData = this.degreetypes.filter(degreetypes => degreetypes.degreeLevel === ob.value.toString());

  }


  //State Dropdown Change Event
  onStateChange(ob): void {

    this.model.institution = '';

    const selectedState = ob.value;

    this.db.list('/institutions/', ref => ref
      .orderByChild('state')
      .equalTo(selectedState))
      .valueChanges().subscribe(
        (

          results: object) => {
          this.schooloptions = results;
          this.schoolfilteredData = this.schooloptions.filter(institutions => institutions.state === selectedState);

        }
      );

  }


  openConfirmationDialog(key): void {
    //Open the dialog and save the reference of it
    const dialogRef = this._fuseConfirmationService.open(this.dialogconfigForm.value);

    //Subscribe to afterClosed from the dialog reference
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.onDelete(key);
      }
    });
  }


  ngOnInit(): void {

    this.items = this.db.list('/users/' + this.fbuser.id + '/degrees').snapshotChanges();

    //Formbuilder for Dialog Popup
    this.dialogconfigForm = this._formBuilder.group({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item permanently? <span class="font-medium">This action cannot be undone!</span>',
      icon: this._formBuilder.group({
        show: true,
        name: 'heroicons_outline:exclamation',
        color: 'warn'
      }),
      actions: this._formBuilder.group({
        confirm: this._formBuilder.group({
          show: true,
          label: 'Remove',
          color: 'warn'
        }),
        cancel: this._formBuilder.group({
          show: true,
          label: 'Cancel'
        })
      }),
      dismissible: false
    });

    //Prepopulate Field of Study Autocomplete
    this.fieldfilteredData = this.fieldoptions;

    //Only need if prepopulating dropbox without filter
    //this.schoolfilteredData = this.schooloptions;
    //this.degreetypesfilteredData = this.degreetypes;

  }

}


// Empty Education class
export class Education {

  constructor(
    public key: string = '',
    public state: string = '',
    public institution: string = '',
    public degreelevel: string = '',
    public degreetype: string = '',
    public major: string = '',
    public minor: string = '',
    public completed: boolean = true,
    public awardedon: string = '',
    public created: string = '',
    public modified: string = '',
    public user: string = '',

  ) { }

}

