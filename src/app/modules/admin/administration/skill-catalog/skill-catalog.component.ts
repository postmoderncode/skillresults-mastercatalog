import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Observable, combineLatest, mapTo, map, merge, forkJoin, zip } from 'rxjs';


@Component({
  selector: 'app-skill-catalog',
  templateUrl: './skill-catalog.component.html',
  styleUrls: ['./skill-catalog.component.scss']
})
export class SkillCatalogComponent implements OnInit {

  //Initialize Varables
  //-------------------

  //Scroll element
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;

  //Current User
  fbuser = JSON.parse(localStorage.getItem('fbuser'));

  //Confirmation Dialog
  dialogconfigForm: FormGroup;

  //Empty Model
  model = new CatItem();
  catmodel = new CatalogState();

  //Firebase Observables
  listRef: AngularFireList<any>;
  item: Observable<any>;

  //Form Visibility Modifiers
  showadditem = false;
  showedititem = false;

  //Object to Hold All Areas.
  areasmaster: Observable<any>;
  areascustoms: Observable<any>;
  areascombo;
  areas;

  //Object to Hold Current Category List.
  categoriesmaster: Observable<any>;
  categoriescustoms: Observable<any>;
  categories: object;

  //Object to Hold Current Skill List.
  skillsmaster: Observable<any>;
  skillscustoms: Observable<any>;
  skills: object;

  //General Component Variables
  selectedIndex = 0;
  tabTitle = 'Area';

  /**
   * Constructor
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    public db: AngularFireDatabase
  ) { }

  //Function to Handle the Back Arrow
  goback(): void {
    switch (this.selectedIndex) {
      case 1: {
        this.tabTitle = 'Area';
        this.selectedIndex = 0;
        this.catmodel.currentCategory = '';
        this.catmodel.currentSkill = '';
        break;
      }
      case 2: {
        this.tabTitle = 'Category';
        this.selectedIndex = 1;
        this.catmodel.currentSkill = '';
        break;
      }
    }
  }

  //Function for unique value of name for search/duplicates
  onConvertName(name: string): string {
    //trim leading and trailing spaces
    const trimname: string = name.trim();

    //replace spaces and multiple spaces with dash
    const dashname: string = trimname.replace(/\s+/g, '-');

    //covert to lowercase
    const value: string = dashname.toLowerCase();

    return value;

  }

  //Function to call when an area is selected
  onAreaSelect(areaId): void {

    //Populate Categories - Firebase List w/ Sort&Filter Query
    this.categoriesmaster = this.db.list('/skillcatalog/categories/', ref => ref
      .orderByChild('area')
      .equalTo(areaId))
      .snapshotChanges();

    this.categoriescustoms = this.db.list('/customs/categories/', ref => ref
      .orderByChild('key'))
      .snapshotChanges();

    combineLatest(
      [this.categoriesmaster, this.categoriescustoms],
      (master, customs) =>
        master.map((s) => ({
          ...s,
          customs: customs.filter((a) => a.key === s.key),
        })) // combineLatest also takes an optional projection function
    ).subscribe(
      (combinedresults) => {
        this.categories = combinedresults;
        console.log(this.categories);
      }
    );

    //Set the title
    this.tabTitle = 'Category';

    //Set the tab to categories
    this.selectedIndex = 1;

    this.catmodel.currentArea = areaId;

  }

  //Function to call when a category is selected
  onCategorySelect(categoryId): void {

    console.log(categoryId);

    //Populate Skills - Firebase List w/ Sort&Filter Query
    this.skillsmaster = this.db.list('/skillcatalog/skills/', ref => ref
      .orderByChild('category')
      .equalTo(categoryId))
      .snapshotChanges();

    this.skillscustoms = this.db.list('/customs/skills/', ref => ref
      .orderByChild('key'))
      .snapshotChanges();

    combineLatest(
      [this.skillsmaster, this.skillscustoms],
      (master, customs) =>
        master.map((s) => ({
          ...s,
          customs: customs.filter((a) => a.key === s.key),
        })) // combineLatest also takes an optional projection function
    ).subscribe(
      (combinedresults) => {
        this.skills = combinedresults;
        console.log(this.skills);
      }
    );

    this.tabTitle = 'Skill';
    this.selectedIndex = 2;
    this.catmodel.currentCategory = categoryId;
  }

  //Function to call when a skill is selected
  selectSkill(skillId): void {

    this.catmodel.currentSkill = skillId;
  }

  onAdd(): void {

    let type: string;

    //Switch catalog path based on item type
    if (this.tabTitle.toLowerCase() === 'category') {
      type = 'categories';
    }
    else {
      type = this.tabTitle.toLowerCase() + 's';
    }

    //Set Firebase Path
    this.listRef = this.db.list('/customs/' + type);

    //Define and call Promise to add Item with hierachial attributes
    if (this.tabTitle.toLowerCase() === 'area') {

      //Cast model to variable for formReset
      const mname: string = this.model.name;
      const mdescription: string = this.model.description;
      const mvalue: string = this.onConvertName(this.model.name);

      //Define Promise
      const promiseAddItem = this.listRef.push({ name: mname, value: mvalue, description: mdescription });

      //Call Promise
      promiseAddItem
        .then(_ => this.showadditem = false)
        .catch(err => console.log(err, 'Error Submitting Item!'));

    }
    else if (this.tabTitle.toLowerCase() === 'category') {

      //Cast model to variable for formReset
      const mname: string = this.model.name;
      const mdescription: string = this.model.description;
      const mvalue: string = this.onConvertName(this.model.name);
      const marea: string = this.catmodel.currentArea;

      //Define Promise
      const promiseAddItem = this.listRef.push({ area: marea, name: mname, value: mvalue, description: mdescription });

      //Call Promise
      promiseAddItem
        .then(_ => this.showadditem = false)
        .catch(err => console.log(err, 'Error Submitting Item!'));

    }
    else { //this is a skill

      //Cast model to variable for formReset
      const mname: string = this.model.name;
      const mdescription: string = this.model.description;
      const mvalue: string = this.onConvertName(this.model.name);
      const mcategory: string = this.catmodel.currentCategory;

      //Define Promise
      const promiseAddItem = this.listRef.push({ category: mcategory, name: mname, value: mvalue, description: mdescription });

      //Call Promise
      promiseAddItem
        .then(_ => this.showadditem = false)
        .catch(err => console.log(err, 'Error Submitting Item!'));

    }

  }

  onEdit(key: string): void {

    //Cast model to variable for formReset
    const mname: string = this.model.name;
    const mdescription: string = this.model.description;
    const mvalue: string = this.onConvertName(this.model.name);

    //Define and call Promise to add Item
    if (this.tabTitle.toLowerCase() === 'area') {

      this.db.object('/customs/areas/' + key)
        .update({ name: mname, description: mdescription, value: mvalue });

    }
    else if (this.tabTitle.toLowerCase() === 'category') {

      this.db.object('/customs/categories/' + key)
        .update({ name: mname, description: mdescription, value: mvalue });

    }
    else { //this is a skill

      this.db.object('/customs/skills/' + key)
        .update({ name: mname, description: mdescription, value: mvalue });

    }

    this.showedititem = false;

  }

  onDelete(key: string): void {

    console.log(key + ' deleted');

  }

  //Contextual Button based on tabTitle
  onShowAddForm(type: string): void {
    this.showedititem = false;
    this.showadditem = true;

  }

  onHideAddForm(): void {
    this.showadditem = false;

  }

  onShowEditForm(key: string): void {

    this.showadditem = false;
    this.showedititem = true;


    //Define and call Promise to add Item
    if (this.tabTitle.toLowerCase() === 'area') {

      //Define Observable
      this.item = this.db.object('/skillcatalog/areas/' + key).valueChanges();

      //Subscribe to Observable
      this.item.subscribe((item) => {
        this.model = new CatItem(key, item.name, item.value, item.description);
      });

    }
    else if (this.tabTitle.toLowerCase() === 'category') {

      //Define Observable
      this.item = this.db.object('/skillcatalog/categories/' + key).valueChanges();

      //Subscribe to Observable
      this.item.subscribe((item) => {
        this.model = new CatItem(key, item.name, item.value, item.description, item.area);
      });

    }
    else { //this is a skill

      //Define Observable
      this.item = this.db.object('/skillcatalog/skills/' + key).valueChanges();

      //Subscribe to Observable
      this.item.subscribe((item) => {
        this.model = new CatItem(key, item.name, item.value, item.description, item.category);
      });

    }

  }

  onHideItem(key: string): void {

    console.log('This ' + this.tabTitle + ' is hidden: ' + key);

    //Write item to Custom skill tree
    let type: string;

    //Switch catalog path based on item type
    if (this.tabTitle.toLowerCase() === 'category') {
      type = 'categories';
    }
    else {
      type = this.tabTitle.toLowerCase() + 's';
    }

    //If Hidden Exists, Delete. Otherwise set Hidden 
    this.db.object('/customs/' + type + '/' + key + '/hidden')
      .query.ref.transaction((hidden) => {
        if (hidden === true) {
          this.db.object('/customs/' + type + '/' + key + '/hidden').remove();
        } else {
          return hidden = true;
        }
      });

  }

  onHideEditForm(): void {
    this.showedititem = false;
    this.model = new CatItem();

  }

  openConfirmationDialog(key): void {
    // Open the dialog and save the reference of it
    const dialogRef = this._fuseConfirmationService.open(this.dialogconfigForm.value);

    // Subscribe to afterClosed from the dialog reference
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.onDelete(key);
      }
    });
  }

  ngOnInit(): void {

    //Populate Areas - Firebase List Object
    this.areasmaster = this.db.list('/skillcatalog/areas/', ref => ref
      .orderByChild('name'))
      .snapshotChanges();

    this.areascustoms = this.db.list('/customs/areas/', ref => ref
      .orderByChild('key'))
      .snapshotChanges();


    this.areascombo = combineLatest(
      [this.areasmaster, this.areascustoms],
      (a, b) =>
        //map togather on key
        a.map((s) => ({
          ...s,
          customs: b.filter((a) => a.key === s.key),

        }),

          //next operator
          // map(([a, b]) => ({ a, b })),

        )
    );
    // .subscribe(
    //   (res) => {
    //     this.areas = res;
    //     console.log(this.areas);
    //   }
    // );


    //Combine search results
    this.areascombo.subscribe((master) => {
      this.areascustoms.subscribe((custom) => {

        let results;
        results = master.concat(custom);

        console.log(results)
        this.areas = results;

      });

    });


    // zip(this.areascombo, this.areascustoms).pipe(
    //   map(([a, b]) => ({ a, b })),
    // )
    //   .subscribe(x => {
    //     this.areas = x.a
    //     console.log(this.areas);
    //     console.log(x.b);
    //   });


    // combineLatest(
    //   [this.areascombo, this.areascustoms],
    //   (a, b) => {
    //     // some filter here
    //     const filtered = a.filter(i => !b.includes(i));
    //     //console.log(...filtered, b);
    //     return [...filtered, b];
    //     // const res = a.concat.b;
    //     // return res;
    //     //const combo = merge(master, customs);
    //     // const combo = a;
    //     // return combo;


    //   }
    // ).subscribe(
    //   (res) => {
    //     this.areas = res;
    //     console.log(this.areas);
    //   }
    // );




    //Formbuilder for Dialog Popup
    this.dialogconfigForm = this._formBuilder.group({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this ' + this.tabTitle + ' permanently? <span class="font-medium">This action cannot be undone!</span>',
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

  }

}


// Empty Catalog Item class
export class CatItem {

  constructor(
    public key: string = '',
    public name: string = '',
    public value: string = '',
    public description: string = '',
    public area?,
    public category?,

  ) { }

}

// Empty CatalogState class
export class CatalogState {

  constructor(
    public currentArea?: string,
    public currentCategory?: string,
    public currentSkill?: string,

  ) { }

}



